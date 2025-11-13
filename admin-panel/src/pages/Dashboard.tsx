import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { FileText, Users, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import './Dashboard.css';

interface Stats {
  totalSchemes: number;
  activeSchemes: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

interface RecentApplication {
  id: string;
  schemeName: string;
  userName: string;
  status: string;
  applicationDate: Date;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalSchemes: 0,
    activeSchemes: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load schemes statistics
      const schemesSnapshot = await getDocs(collection(db, 'government_schemes'));
      const activeSchemes = schemesSnapshot.docs.filter(doc => doc.data().status === 'active');

      // Load applications statistics
      const applicationsSnapshot = await getDocs(collection(db, 'scheme_applications'));
      const applications = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        applicationDate: doc.data().applicationDate?.toDate(),
      })) as RecentApplication[];

      const pending = applications.filter(app => app.status === 'pending');
      const approved = applications.filter(app => app.status === 'approved');
      const rejected = applications.filter(app => app.status === 'rejected');

      setStats({
        totalSchemes: schemesSnapshot.size,
        activeSchemes: activeSchemes.length,
        totalApplications: applicationsSnapshot.size,
        pendingApplications: pending.length,
        approvedApplications: approved.length,
        rejectedApplications: rejected.length,
      });

      // Get recent applications (last 5)
      const sortedApplications = applications
        .sort((a, b) => (b.applicationDate?.getTime() || 0) - (a.applicationDate?.getTime() || 0))
        .slice(0, 5);
      
      setRecentApplications(sortedApplications);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      pending: '#FF9800',
      approved: '#4CAF50',
      rejected: '#F44336',
      under_review: '#2196F3',
    };
    return statusColors[status] || '#666';
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Government Schemes Management Overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">
            <FileText size={32} />
          </div>
          <div className="stat-content">
            <h3>Total Schemes</h3>
            <p className="stat-number">{stats.totalSchemes}</p>
            <span className="stat-label">{stats.activeSchemes} Active</span>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">
            <Users size={32} />
          </div>
          <div className="stat-content">
            <h3>Total Applications</h3>
            <p className="stat-number">{stats.totalApplications}</p>
            <span className="stat-label">All time</span>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">
            <Clock size={32} />
          </div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-number">{stats.pendingApplications}</p>
            <span className="stat-label">Needs review</span>
          </div>
        </div>

        <div className="stat-card stat-approved">
          <div className="stat-icon">
            <CheckCircle size={32} />
          </div>
          <div className="stat-content">
            <h3>Approved</h3>
            <p className="stat-number">{stats.approvedApplications}</p>
            <span className="stat-label">Success rate: {stats.totalApplications > 0 ? Math.round((stats.approvedApplications / stats.totalApplications) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-applications">
          <div className="section-header">
            <h2>Recent Applications</h2>
            <a href="/applications" className="view-all-link">View All →</a>
          </div>

          {recentApplications.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={48} />
              <p>No applications yet</p>
            </div>
          ) : (
            <div className="applications-list">
              {recentApplications.map(app => (
                <div key={app.id} className="application-item">
                  <div className="application-info">
                    <h4>{app.schemeName}</h4>
                    <p className="applicant-name">👤 {app.userName}</p>
                    <p className="application-date">
                      📅 {app.applicationDate?.toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="application-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusBadge(app.status) }}
                    >
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-stats">
          <h2>Quick Stats</h2>
          <div className="quick-stats-list">
            <div className="quick-stat-item">
              <span className="quick-stat-label">Approval Rate</span>
              <span className="quick-stat-value">
                {stats.totalApplications > 0 
                  ? Math.round((stats.approvedApplications / stats.totalApplications) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="quick-stat-item">
              <span className="quick-stat-label">Under Review</span>
              <span className="quick-stat-value">{stats.pendingApplications}</span>
            </div>
            <div className="quick-stat-item">
              <span className="quick-stat-label">Rejected</span>
              <span className="quick-stat-value">{stats.rejectedApplications}</span>
            </div>
            <div className="quick-stat-item">
              <span className="quick-stat-label">Active Schemes</span>
              <span className="quick-stat-value">{stats.activeSchemes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
