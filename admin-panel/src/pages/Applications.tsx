import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Search, CheckCircle, X, Clock, AlertCircle, Eye, Filter } from 'lucide-react';
import './Applications.css';

interface Application {
  id: string;
  schemeId: string;
  schemeName: string;
  userId: string;
  userName: string;
  userPhone: string;
  userState: string;
  userDistrict: string;
  farmerName: string;
  fatherName?: string;
  aadharNumber: string;
  mobileNumber: string;
  address: string;
  landHolding?: string;
  cropType?: string;
  bankAccount?: string;
  ifscCode?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'documents_required';
  remarks?: string;
  applicationDate: Date;
  lastUpdated: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'documents_required'>('approve');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const loadApplications = async () => {
    try {
      const q = query(collection(db, 'scheme_applications'), orderBy('applicationDate', 'desc'));
      const snapshot = await getDocs(q);
      const appsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        applicationDate: doc.data().applicationDate?.toDate(),
        lastUpdated: doc.data().lastUpdated?.toDate(),
        reviewedAt: doc.data().reviewedAt?.toDate(),
      })) as Application[];
      setApplications(appsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading applications:', error);
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.schemeName.toLowerCase().includes(term) ||
        app.userName.toLowerCase().includes(term) ||
        app.farmerName.toLowerCase().includes(term) ||
        app.userPhone.includes(term) ||
        app.aadharNumber.includes(term)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleReview = async () => {
    if (!selectedApp) return;

    setSubmitting(true);
    try {
      const newStatus = reviewAction;
      await updateDoc(doc(db, 'scheme_applications', selectedApp.id), {
        status: newStatus,
        remarks: remarks || `Application ${newStatus.replace('_', ' ')}`,
        lastUpdated: serverTimestamp(),
        reviewedBy: auth.currentUser?.email || 'admin',
        reviewedAt: serverTimestamp(),
      });

      alert(`Application ${newStatus.replace('_', ' ')} successfully!`);
      setShowReviewModal(false);
      setRemarks('');
      loadApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#FF9800',
      under_review: '#2196F3',
      approved: '#4CAF50',
      rejected: '#F44336',
      documents_required: '#9C27B0',
    };
    return colors[status] || '#666';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <X size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'under_review': return <Eye size={16} />;
      case 'documents_required': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="applications-page">
      <div className="page-header">
        <div>
          <h1>Review Applications</h1>
          <p>Manage and review scheme applications from farmers</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by scheme, farmer name, phone, or Aadhar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filters">
          <button
            className={statusFilter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setStatusFilter('all')}
          >
            All ({applications.length})
          </button>
          <button
            className={statusFilter === 'pending' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button
            className={statusFilter === 'under_review' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setStatusFilter('under_review')}
          >
            Under Review ({applications.filter(a => a.status === 'under_review').length})
          </button>
          <button
            className={statusFilter === 'approved' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setStatusFilter('approved')}
          >
            Approved ({applications.filter(a => a.status === 'approved').length})
          </button>
          <button
            className={statusFilter === 'rejected' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected ({applications.filter(a => a.status === 'rejected').length})
          </button>
        </div>
      </div>

      <div className="applications-table">
        <table>
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Scheme Name</th>
              <th>Farmer Name</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Applied On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-row">
                  <div className="empty-state">
                    <AlertCircle size={48} />
                    <p>No applications found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredApplications.map(app => (
                <tr key={app.id}>
                  <td className="app-id">#{app.id.slice(-6)}</td>
                  <td className="scheme-name">{app.schemeName}</td>
                  <td className="farmer-name">{app.farmerName}</td>
                  <td className="contact">
                    <div>{app.userPhone}</div>
                    <div className="small-text">Aadhar: {app.aadharNumber}</div>
                  </td>
                  <td className="location">
                    <div>{app.userDistrict}</div>
                    <div className="small-text">{app.userState}</div>
                  </td>
                  <td className="date">{formatDate(app.applicationDate)}</td>
                  <td className="status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(app.status) }}
                    >
                      {getStatusIcon(app.status)}
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setShowDetailModal(true);
                      }}
                      className="view-btn"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    {app.status !== 'approved' && app.status !== 'rejected' && (
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setShowReviewModal(true);
                        }}
                        className="review-btn"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApp && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <h3>Scheme Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Scheme Name:</label>
                    <span>{selectedApp.schemeName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedApp.status) }}
                    >
                      {getStatusIcon(selectedApp.status)}
                      {selectedApp.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Application Date:</label>
                    <span>{formatDate(selectedApp.applicationDate)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <span>{formatDate(selectedApp.lastUpdated)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Farmer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Full Name:</label>
                    <span>{selectedApp.farmerName}</span>
                  </div>
                  {selectedApp.fatherName && (
                    <div className="detail-item">
                      <label>Father's Name:</label>
                      <span>{selectedApp.fatherName}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>Mobile Number:</label>
                    <span>{selectedApp.mobileNumber}</span>
                  </div>
                  <div className="detail-item">
                    <label>Aadhar Number:</label>
                    <span>{selectedApp.aadharNumber}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Address:</label>
                    <span>{selectedApp.address}</span>
                  </div>
                  <div className="detail-item">
                    <label>District:</label>
                    <span>{selectedApp.userDistrict}</span>
                  </div>
                  <div className="detail-item">
                    <label>State:</label>
                    <span>{selectedApp.userState}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Agricultural Information</h3>
                <div className="detail-grid">
                  {selectedApp.landHolding && (
                    <div className="detail-item">
                      <label>Land Holding:</label>
                      <span>{selectedApp.landHolding} acres</span>
                    </div>
                  )}
                  {selectedApp.cropType && (
                    <div className="detail-item">
                      <label>Primary Crop:</label>
                      <span>{selectedApp.cropType}</span>
                    </div>
                  )}
                </div>
              </div>

              {(selectedApp.bankAccount || selectedApp.ifscCode) && (
                <div className="detail-section">
                  <h3>Bank Information</h3>
                  <div className="detail-grid">
                    {selectedApp.bankAccount && (
                      <div className="detail-item">
                        <label>Account Number:</label>
                        <span>{selectedApp.bankAccount}</span>
                      </div>
                    )}
                    {selectedApp.ifscCode && (
                      <div className="detail-item">
                        <label>IFSC Code:</label>
                        <span>{selectedApp.ifscCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedApp.remarks && (
                <div className="detail-section">
                  <h3>Remarks</h3>
                  <p className="remarks-text">{selectedApp.remarks}</p>
                  {selectedApp.reviewedBy && (
                    <p className="review-info">
                      Reviewed by: {selectedApp.reviewedBy} on {formatDate(selectedApp.reviewedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedApp.status !== 'approved' && selectedApp.status !== 'rejected' && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowReviewModal(true);
                  }}
                  className="review-btn-large"
                >
                  Review Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedApp && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Application</h2>
              <button onClick={() => setShowReviewModal(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <div className="review-content">
              <div className="review-info">
                <p><strong>Scheme:</strong> {selectedApp.schemeName}</p>
                <p><strong>Farmer:</strong> {selectedApp.farmerName}</p>
                <p><strong>Application ID:</strong> #{selectedApp.id.slice(-6)}</p>
              </div>

              <div className="review-actions">
                <label>Select Action:</label>
                <div className="action-buttons">
                  <button
                    className={reviewAction === 'approve' ? 'action-btn approve active' : 'action-btn approve'}
                    onClick={() => setReviewAction('approve')}
                  >
                    <CheckCircle size={20} />
                    Approve
                  </button>
                  <button
                    className={reviewAction === 'documents_required' ? 'action-btn documents active' : 'action-btn documents'}
                    onClick={() => setReviewAction('documents_required')}
                  >
                    <AlertCircle size={20} />
                    Documents Required
                  </button>
                  <button
                    className={reviewAction === 'reject' ? 'action-btn reject active' : 'action-btn reject'}
                    onClick={() => setReviewAction('reject')}
                  >
                    <X size={20} />
                    Reject
                  </button>
                </div>
              </div>

              <div className="review-remarks">
                <label>Remarks / Comments:</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks or reason for your decision..."
                  rows={4}
                />
              </div>

              <div className="review-submit">
                <button onClick={() => setShowReviewModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  disabled={submitting}
                  className="submit-btn"
                >
                  {submitting ? 'Submitting...' : `Confirm ${reviewAction.replace('_', ' ')}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
