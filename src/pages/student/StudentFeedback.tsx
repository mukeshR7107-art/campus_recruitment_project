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
          <div className="animate-spin w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruiter Feedback & Evaluations</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Qualitative evaluations, interview feedback, and recommendations provided by campus recruiters.
          </p>
        </div>

        {feedbackList.length === 0 ? (
          <EmptyState
            title="No feedback records yet"
            description="When corporate recruiters review your submitted applications or complete interview rounds, their structured evaluations will appear here."
            icon={<MessageSquare className="w-8 h-8 text-slate-400" />}
          />
        ) : (
          <div className="grid gap-5">
            {feedbackList.map(fb => (
              <Card key={fb.id} hoverEffect>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-center text-brand-700 font-extrabold text-xs shrink-0">
                    {((fb as any).profiles?.email?.[0] ?? 'R').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {(fb as any).profiles?.email ?? 'Recruiting Team'}
                        </p>
                        <span className="text-[11px] font-semibold text-brand-600">Verified Corporate Evaluator</span>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {fb.content && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assessment Summary</p>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{fb.content}</p>
                      </div>
                    )}

                    {fb.comments && (
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Specific Recommendations & Notes</p>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{fb.comments}</p>
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
