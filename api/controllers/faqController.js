import FAQ from '../models/FAQ.js';

const getAllFAQs = async (req, res) => {
  try {
    const { category, isActive, search, sortBy = 'priority', sortOrder = 'desc' } = req.query;
    
    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    if (sortBy !== 'createdAt') {
      sort.createdAt = -1;
    }

    const faqs = await FAQ.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort(sort);

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching FAQs',
      error: error.message
    });
  }
};

const getFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      data: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching FAQ',
      error: error.message
    });
  }
};

const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, isActive, priority, tags } = req.body;
    const userId = req.user?.id || 'system';

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required'
      });
    }

    const faqData = {
      question,
      answer,
      category: category || 'general',
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || 0,
      tags: tags || [],
      createdBy: userId === 'system' ? null : userId,
      lastModifiedBy: userId === 'system' ? null : userId
    };

    const faq = await FAQ.create(faqData);
    
    await faq.populate('createdBy', 'firstName lastName email');
    await faq.populate('lastModifiedBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating FAQ',
      error: error.message
    });
  }
};

const updateFAQ = async (req, res) => {
  try {
    const { question, answer, category, isActive, priority, tags } = req.body;
    const userId = req.user.id;

    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    // Update fields
    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (category !== undefined) faq.category = category;
    if (isActive !== undefined) faq.isActive = isActive;
    if (priority !== undefined) faq.priority = priority;
    if (tags !== undefined) faq.tags = tags;
    
    faq.lastModifiedBy = userId;

    await faq.save();
    
    await faq.populate('createdBy', 'firstName lastName email');
    await faq.populate('lastModifiedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating FAQ',
      error: error.message
    });
  }
};

const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    await FAQ.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting FAQ',
      error: error.message
    });
  }
};

const toggleFAQStatus = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    faq.isActive = !faq.isActive;
    faq.lastModifiedBy = req.user.id;

    await faq.save();
    
    await faq.populate('createdBy', 'firstName lastName email');
    await faq.populate('lastModifiedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: `FAQ ${faq.isActive ? 'activated' : 'deactivated'} successfully`,
      data: faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while toggling FAQ status',
      error: error.message
    });
  }
};

const getFAQStats = async (req, res) => {
  try {
    const totalFAQs = await FAQ.countDocuments();
    const activeFAQs = await FAQ.countDocuments({ isActive: true });
    const inactiveFAQs = await FAQ.countDocuments({ isActive: false });
    
    const categoryStats = await FAQ.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalFAQs,
        active: activeFAQs,
        inactive: inactiveFAQs,
        byCategory: categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching FAQ statistics',
      error: error.message
    });
  }
};

export {
  getAllFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  toggleFAQStatus,
  getFAQStats
};
