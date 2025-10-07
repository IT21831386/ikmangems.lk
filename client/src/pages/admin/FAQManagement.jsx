import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, MoreVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { faqService } from '../../services/faqAPI';
import toast from 'react-hot-toast';

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    priority: 0,
    tags: '',
    isActive: true
  });

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'seller', label: 'Seller' },
    { value: 'buyer', label: 'Buyer' },
    { value: 'auction', label: 'Auction' },
    { value: 'payment', label: 'Payment' },
    { value: 'verification', label: 'Verification' },
    { value: 'support', label: 'Support' }
  ];

  useEffect(() => {
    fetchFAQs();
  }, [searchTerm, categoryFilter, statusFilter]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.isActive = statusFilter === 'active';
      
      const response = await faqService.getAllFAQs(params);
      setFaqs(response.data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFAQ = async (e) => {
    e.preventDefault();
    try {
      const faqData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      const response = await faqService.createFAQ(faqData);
      toast.success('FAQ created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchFAQs();
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast.error(error.message || 'Failed to create FAQ');
    }
  };

  const handleUpdateFAQ = async (e) => {
    e.preventDefault();
    try {
      const faqData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await faqService.updateFAQ(editingFAQ._id, faqData);
      toast.success('FAQ updated successfully');
      setIsEditDialogOpen(false);
      setEditingFAQ(null);
      resetForm();
      fetchFAQs();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error(error.message || 'Failed to update FAQ');
    }
  };

  const handleDeleteFAQ = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    
    try {
      await faqService.deleteFAQ(id);
      toast.success('FAQ deleted successfully');
      fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await faqService.toggleFAQStatus(id);
      toast.success('FAQ status updated');
      fetchFAQs();
    } catch (error) {
      console.error('Error toggling FAQ status:', error);
      toast.error('Failed to update FAQ status');
    }
  };

  const openEditDialog = (faq) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      priority: faq.priority,
      tags: faq.tags.join(', '),
      isActive: faq.isActive
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      priority: 0,
      tags: '',
      isActive: true
    });
  };

  const FAQForm = ({ onSubmit, title, submitText }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="question">Question *</Label>
        <Input
          id="question"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          placeholder="Enter FAQ question"
          required
          autoComplete="off"
        />
      </div>
      
      <div>
        <Label htmlFor="answer">Answer *</Label>
        <Textarea
          id="answer"
          value={formData.answer}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          placeholder="Enter FAQ answer"
          rows={4}
          required
          className="resize-none"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="priority">Priority</Label>
          <div className="flex items-center space-x-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData({ ...formData, priority: Math.max(0, formData.priority - 1) })}
              className="px-2"
            >
              <ChevronDown size={16} />
            </Button>
            <Input
              id="priority"
              type="number"
              value={formData.priority}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setFormData({ ...formData, priority: '' });
                } else {
                  const numValue = parseInt(value);
                  if (!isNaN(numValue)) {
                    setFormData({ ...formData, priority: Math.min(100, Math.max(0, numValue)) });
                  }
                }
              }}
              onBlur={(e) => {
                if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                  setFormData({ ...formData, priority: 0 });
                }
              }}
              min="0"
              max="100"
              className="text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData({ ...formData, priority: Math.min(100, formData.priority + 1) })}
              className="px-2"
            >
              <ChevronUp size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="e.g., registration, seller, verification"
          autoComplete="off"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingFAQ(null);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">{submitText}</Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading FAQs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2" size={16} />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New FAQ</DialogTitle>
            </DialogHeader>
            <FAQForm onSubmit={handleCreateFAQ} submitText="Create FAQ" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No FAQs found</p>
            </CardContent>
          </Card>
        ) : (
          faqs.map((faq) => (
            <Card key={faq._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={faq.isActive ? "default" : "secondary"}>
                        {faq.category}
                      </Badge>
                      <Badge variant="outline">
                        Priority: {faq.priority}
                      </Badge>
                      {faq.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openEditDialog(faq)}>
                        <Edit className="mr-2" size={16} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(faq._id)}>
                        {faq.isActive ? (
                          <>
                            <EyeOff className="mr-2" size={16} />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2" size={16} />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteFAQ(faq._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2" size={16} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{faq.answer}</p>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                  <span>Created: {new Date(faq.createdAt).toLocaleDateString()}</span>
                  <span>Modified: {new Date(faq.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
          </DialogHeader>
          <FAQForm onSubmit={handleUpdateFAQ} submitText="Update FAQ" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQManagement;
