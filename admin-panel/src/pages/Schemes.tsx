import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import './Schemes.css';

interface Scheme {
  id?: string;
  title: string;
  description: string;
  eligibility: string[];
  benefits: string;
  documents: string[];
  deadline: string;
  category: string;
  icon: string;
  status: 'active' | 'coming_soon' | 'expired';
  createdAt?: Date;
  updatedAt?: Date;
}

const categories = [
  { id: 'credit', name: 'Credit & Loans', icon: '💰' },
  { id: 'insurance', name: 'Insurance', icon: '🛡️' },
  { id: 'subsidy', name: 'Subsidies', icon: '🎯' },
  { id: 'technology', name: 'Technology', icon: '🚜' },
  { id: 'training', name: 'Training', icon: '📚' },
];

const Schemes = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [formData, setFormData] = useState<Scheme>({
    title: '',
    description: '',
    eligibility: [''],
    benefits: '',
    documents: [''],
    deadline: '',
    category: 'credit',
    icon: '💰',
    status: 'active',
  });

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'government_schemes'));
      const schemesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Scheme[];
      setSchemes(schemesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading schemes:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const schemeData = {
        ...formData,
        eligibility: formData.eligibility.filter(e => e.trim()),
        documents: formData.documents.filter(d => d.trim()),
        updatedAt: serverTimestamp(),
      };

      if (editingScheme && editingScheme.id) {
        // Update existing scheme
        await updateDoc(doc(db, 'government_schemes', editingScheme.id), schemeData);
        alert('Scheme updated successfully!');
      } else {
        // Add new scheme
        await addDoc(collection(db, 'government_schemes'), {
          ...schemeData,
          createdAt: serverTimestamp(),
        });
        alert('Scheme added successfully!');
      }

      setShowModal(false);
      resetForm();
      loadSchemes();
    } catch (error) {
      console.error('Error saving scheme:', error);
      alert('Failed to save scheme');
    }
  };

  const handleEdit = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setFormData({
      ...scheme,
      eligibility: scheme.eligibility.length ? scheme.eligibility : [''],
      documents: scheme.documents.length ? scheme.documents : [''],
    });
    setShowModal(true);
  };

  const handleDelete = async (schemeId: string) => {
    if (!confirm('Are you sure you want to delete this scheme?')) return;

    try {
      await deleteDoc(doc(db, 'government_schemes', schemeId));
      alert('Scheme deleted successfully!');
      loadSchemes();
    } catch (error) {
      console.error('Error deleting scheme:', error);
      alert('Failed to delete scheme');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eligibility: [''],
      benefits: '',
      documents: [''],
      deadline: '',
      category: 'credit',
      icon: '💰',
      status: 'active',
    });
    setEditingScheme(null);
  };

  const handleArrayFieldChange = (field: 'eligibility' | 'documents', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: 'eligibility' | 'documents') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayField = (field: 'eligibility' | 'documents', index: number) => {
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });
  };

  if (loading) {
    return <div className="loading">Loading schemes...</div>;
  }

  return (
    <div className="schemes-page">
      <div className="page-header">
        <div>
          <h1>Manage Schemes</h1>
          <p>Add, edit, or remove government schemes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="add-btn">
          <Plus size={20} />
          Add New Scheme
        </button>
      </div>

      <div className="schemes-grid">
        {schemes.map(scheme => (
          <div key={scheme.id} className="scheme-card">
            <div className="scheme-header">
              <span className="scheme-icon">{scheme.icon}</span>
              <span className={`status-badge status-${scheme.status}`}>
                {scheme.status.replace('_', ' ')}
              </span>
            </div>
            <h3>{scheme.title}</h3>
            <p className="scheme-benefits">{scheme.benefits}</p>
            <p className="scheme-description">{scheme.description}</p>
            <div className="scheme-meta">
              <span className="category-tag">{categories.find(c => c.id === scheme.category)?.name}</span>
              <span className="deadline">⏰ {scheme.deadline}</span>
            </div>
            <div className="scheme-actions">
              <button onClick={() => handleEdit(scheme)} className="edit-btn">
                <Edit size={16} />
                Edit
              </button>
              <button onClick={() => handleDelete(scheme.id!)} className="delete-btn">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingScheme ? 'Edit Scheme' : 'Add New Scheme'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="scheme-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g., 💰"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>Benefits *</label>
                <input
                  type="text"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="e.g., ₹6,000 per year"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const category = categories.find(c => c.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        category: e.target.value,
                        icon: category?.icon || '💰'
                      });
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="active">Active</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Deadline</label>
                  <input
                    type="text"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    placeholder="e.g., 2024-12-31 or Ongoing"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Eligibility Criteria</label>
                {formData.eligibility.map((item, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayFieldChange('eligibility', index, e.target.value)}
                      placeholder="Eligibility criteria"
                    />
                    {formData.eligibility.length > 1 && (
                      <button type="button" onClick={() => removeArrayField('eligibility', index)} className="remove-btn">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addArrayField('eligibility')} className="add-field-btn">
                  + Add More
                </button>
              </div>

              <div className="form-group">
                <label>Required Documents</label>
                {formData.documents.map((item, index) => (
                  <div key={index} className="array-input">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayFieldChange('documents', index, e.target.value)}
                      placeholder="Document name"
                    />
                    {formData.documents.length > 1 && (
                      <button type="button" onClick={() => removeArrayField('documents', index)} className="remove-btn">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addArrayField('documents')} className="add-field-btn">
                  + Add More
                </button>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingScheme ? 'Update Scheme' : 'Add Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;
