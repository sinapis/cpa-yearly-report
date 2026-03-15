import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { showToast } from '../../store/uiSlice';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTaskByIdQuery, useGetStatusTypesQuery, useUpdateTaskMutation, useGetUsersQuery, useGetReportTypesQuery } from '../../store/api';
import { format, parseISO } from 'date-fns';
import { MessageSquare, Calendar, User, FileText, Activity } from 'lucide-react';

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: task, isLoading } = useGetTaskByIdQuery(taskId);
  const { data: statuses } = useGetStatusTypesQuery(undefined);
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const user = useSelector((state: RootState) => state.auth.user);
  const canEdit = user?.role !== 'employee';

  const { data: users } = useGetUsersQuery('?active=true', { skip: !canEdit });
  const { data: reportTypes } = useGetReportTypesQuery(undefined, { skip: !canEdit });

  const [statusId, setStatusId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [reportTypeId, setReportTypeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [newComment, setNewComment] = useState('');

  // Auto-set status and other fields on load
  React.useEffect(() => {
    if (task) {
      if (!statusId) setStatusId(task.statusId.toString());
      if (!assigneeId) setAssigneeId(task.assigneeId.toString());
      if (!reportTypeId) setReportTypeId(task.reportTypeId.toString());
      if (!dueDate) setDueDate(format(parseISO(task.dueDate), 'yyyy-MM-dd'));
    }
  }, [task, statusId, assigneeId, reportTypeId, dueDate]);

  if (isLoading) return <div className="p-8 text-center">טוען נתונים...</div>;
  if (!task) return <div className="p-8 text-center text-red-500">משימה לא נמצאה.</div>;

  const handleSave = async () => {
    try {
      const updateData: any = { 
        id: task.id, 
        statusId: parseInt(statusId), 
        ...(newComment.trim() ? { comment: newComment } : {}) 
      };
      
      if (canEdit) {
        updateData.assigneeId = parseInt(assigneeId);
        updateData.reportTypeId = parseInt(reportTypeId);
        updateData.dueDate = new Date(dueDate).toISOString();
      }

      await updateTask(updateData).unwrap();
      setNewComment('');
      dispatch(showToast({ message: 'המשימה נשמרה בהצלחה!', type: 'success' }));
      navigate(-1);
    } catch (err) {
      console.error(err);
      dispatch(showToast({ message: 'שגיאה בשמירת המשימה', type: 'error' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 gap-6 flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 drop-shadow-sm flex items-center gap-3">
          <FileText className="text-primary-600" />
          פרטי משימה #{task.id}
        </h2>
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-800 font-medium"
        >
          &larr; חזור
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Task Info Panel */}
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-5">
          <div>
            <span className="text-sm text-gray-500 flex items-center gap-2 mb-1"><User className="w-4 h-4"/> אחראי לביצוע</span>
            {canEdit ? (
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm"
              >
                {users?.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            ) : (
              <div className="font-semibold text-gray-900 border-b pb-2">{task.assignee.firstName} {task.assignee.lastName}</div>
            )}
          </div>
          
          <div>
            <span className="text-sm text-gray-500 flex items-center gap-2 mb-1"><FileText className="w-4 h-4"/> סוג דו"ח</span>
            {canEdit ? (
              <select
                value={reportTypeId}
                onChange={(e) => setReportTypeId(e.target.value)}
                className="w-full border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm"
              >
                {reportTypes?.filter((r: any) => r.active || r.id.toString() === reportTypeId).map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            ) : (
              <div className="font-semibold text-gray-900 border-b pb-2">{task.reportType.name}</div>
            )}
          </div>

          <div>
            <span className="text-sm text-gray-500 flex items-center gap-2 mb-1"><Calendar className="w-4 h-4"/> תאריך יעד</span>
            {canEdit ? (
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm"
              />
            ) : (
              <div className="font-semibold text-gray-900 border-b pb-2">{format(parseISO(task.dueDate), 'dd/MM/yyyy')}</div>
            )}
          </div>

          <div>
            <span className="text-sm text-gray-500 flex items-center gap-2 mb-2"><Activity className="w-4 h-4"/> סטטוס</span>
            <select
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              className="w-full border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm"
            >
              {statuses?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Comments Panel */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              הערות והתפתחות
            </h3>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{task.comments?.length} הערות</span>
          </div>

          <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto max-h-[500px]">
            {task.comments?.length === 0 ? (
              <div className="text-center text-gray-400 py-8 italic">אין הערות למשימה זו.</div>
            ) : (
              <div className="space-y-4">
                {task.comments?.map((comment: any) => (
                  <div key={comment.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm text-gray-800">{comment.author.firstName} {comment.author.lastName}</span>
                      <span className="text-xs text-gray-500">{format(parseISO(comment.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">הוסף הערה חדשה</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="כתוב עדכון לגבי המשימה..."
              className="w-full border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 resize-none shadow-sm"
            />
            
            <div className="mt-4 flex gap-3 justify-end items-center">
              <button
                type="button"
                onClick={() => { 
                  setStatusId(task.statusId.toString()); 
                  setAssigneeId(task.assigneeId.toString());
                  setReportTypeId(task.reportTypeId.toString());
                  setDueDate(format(parseISO(task.dueDate), 'yyyy-MM-dd'));
                  setNewComment(''); 
                }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isUpdating}
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isUpdating || (
                  !newComment.trim() && 
                  statusId === task.statusId.toString() &&
                  (!canEdit || (assigneeId === task.assigneeId.toString() && reportTypeId === task.reportTypeId.toString() && dueDate === format(parseISO(task.dueDate), 'yyyy-MM-dd')))
                )}
                className="px-6 py-2 bg-primary-600 border border-transparent text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'שומר...' : 'שמור שינויים'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
