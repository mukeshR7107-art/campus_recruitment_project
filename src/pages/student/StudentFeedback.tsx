import { useEffect, useState } from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentFeedback } from '../../services/api';
import { Feedback } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentFeedback() {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getStudentFeedback(user.id).then(({ data }) => {
      setFeedbackList((data ?? []) as Feedback[]);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recruiter Feedback</h1>
          <p className="text-sm text-gray-500 mt-0.5">Feedback received from recruiters on your applications.</p>
        </div>

        {feedbackList.length === 0 ? (
          <EmptyState
            title="No feedback yet"
            description="When recruiters review your applications, their feedback will appear here."
            icon={<MessageSquare className="w-8 h-8" />}
          />
        ) : (
          <div className="grid gap-4">
            {feedbackList.map(fb => (
              <Card key={fb.id}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                    {((fb as any).profiles?.email?.[0] ?? 'R').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {(fb as any).profiles?.email ?? 'Recruiter'}
                      </p>
                      <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {fb.content && (
                      <div className="bg-gray-50 rounded-xl p-3 mb-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Feedback</p>
                        <p className="text-sm text-gray-700">{fb.content}</p>
                      </div>
                    )}
                    {fb.comments && (
                      <div className="bg-amber-50 rounded-xl p-3">
                        <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Additional Comments</p>
                        <p className="text-sm text-gray-700">{fb.comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
