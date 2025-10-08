import Bid from "../models/Bid.js";
import Gemstone from "../models/Gem.js";

// GET /gemstone/analytics?name=Ruby&start=2025-08-01&end=2025-09-30
export const getGemstoneAnalytics = async (req, res) => {
  try {
    const { name, start, end } = req.query;

    // Validate inputs
    const dateFilter = {};
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    if (startDate) dateFilter.$gte = startDate;
    if (endDate) {
      // include last day fully
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      dateFilter.$lte = e;
    }

    // Build name filter case-insensitive
    const nameRegex = name ? new RegExp(name, "i") : null;

    // Limit to current seller (mock auth populates req.user)
    const sellerId = req.user?.id;

    // Aggregation: start from bids and join gemstones
    const matchStage = {};
    if (Object.keys(dateFilter).length) matchStage.createdAt = dateFilter;

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: Gemstone.collection.name,
          localField: "gem",
          foreignField: "_id",
          as: "gem",
        },
      },
      { $unwind: "$gem" },
      // Filter by seller and optional name
      {
        $match: {
          ...(sellerId ? { "gem.sellerId": Gemstone.db.base.Types.ObjectId.createFromHexString?.(sellerId) || new Gemstone.db.base.Types.ObjectId(sellerId) } : {}),
          ...(nameRegex ? { "gem.name": { $regex: nameRegex } } : {}),
        },
      },
      {
        $project: {
          amount: 1,
          status: 1,
          createdAt: 1,
          gemName: "$gem.name",
        },
      },
    ];

    const data = await Bid.aggregate(pipeline);

    // Compute summaries in JS for clarity and to avoid complex nested pipelines
    const totalBids = data.length;
    const averagePrice = totalBids
      ? Number((data.reduce((s, b) => s + (b.amount || 0), 0) / totalBids).toFixed(2))
      : 0;

    // Group by day
    const dayKey = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
    const byDayMap = new Map();
    for (const b of data) {
      const key = dayKey(new Date(b.createdAt));
      const entry = byDayMap.get(key) || { date: key, bidCount: 0, total: 0, gemName: b.gemName };
      entry.bidCount += 1;
      entry.total += b.amount || 0;
      byDayMap.set(key, entry);
    }
    const daily = Array.from(byDayMap.values())
      .map((e) => ({ 
        ...e, 
        avgPrice: Number((e.total / e.bidCount).toFixed(2)),
        total: e.total
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Peak day by bid count
    const peakDay = daily.reduce(
      (best, d) => (best && best.bidCount >= d.bidCount ? best : d),
      null
    );

    // Most recent sale = most recent accepted bid
    const accepted = data
      .filter((b) => b.status === "accepted")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const mostRecentSale = accepted.length
      ? { date: accepted[0].createdAt, price: accepted[0].amount }
      : null;

    // Additional metrics
    const totalRevenue = daily.reduce((sum, day) => sum + (day.total || 0), 0);
    const highestBid = Math.max(...data.map(b => b.amount || 0), 0);
    const lowestBid = Math.min(...data.map(b => b.amount || 0), 0);
    const avgBidsPerDay = daily.length ? Number((totalBids / daily.length).toFixed(2)) : 0;

    // Gemstone distribution
    const gemstoneDistribution = {};
    data.forEach(bid => {
      const gemType = bid.gemName || "Unknown";
      gemstoneDistribution[gemType] = (gemstoneDistribution[gemType] || 0) + 1;
    });

    // Price trends (7-day moving average)
    const priceTrends = [];
    for (let i = 6; i < daily.length; i++) {
      const weekData = daily.slice(i - 6, i + 1);
      const avgPrice = weekData.reduce((sum, day) => sum + day.avgPrice, 0) / weekData.length;
      priceTrends.push({
        date: daily[i].date,
        movingAvg: Number(avgPrice.toFixed(2)),
        actual: daily[i].avgPrice
      });
    }

    return res.json({
      success: true,
      data: {
        summary: {
          totalBids,
          averagePrice,
          peakDay: peakDay ? { date: peakDay.date, bids: peakDay.bidCount } : null,
          mostRecentSale,
          totalRevenue,
          highestBid,
          lowestBid,
          avgBidsPerDay,
        },
        daily,
        gemstoneDistribution,
        priceTrends,
        filters: {
          gemstoneName: name,
          startDate: start,
          endDate: end,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Analytics error", error);
    res.status(500).json({ success: false, message: "Failed to load analytics", error: error.message });
  }
};