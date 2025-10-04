import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, FileText, Award, AlertCircle, Settings } from 'lucide-react';
import { 
  getInstanceCourses, 
  getCourseUsers, 
  getCourseCustomReport,
  getCourseReport,
  createCourseReport,
  updateCourseReport,
  deleteCourseReport
} from '../../api/moodle';
import { MoodleCourse, MoodleUser } from '../../types';
import { UserDetailModal } from '../../components/moodle/UserDetailModal';

export const CourseDetail: React.FC = () => {
  const { id, courseId } = useParams<{ id: string; courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<MoodleCourse | null>(null);
  const [users, setUsers] = useState<MoodleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'report' | 'certificates'>('users');
  const [selectedUser, setSelectedUser] = useState<MoodleUser | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showReportConfig, setShowReportConfig] = useState(false);
  const [reportConfig, setReportConfig] = useState({ report_id: '', notes: '' });
  const [savingReport, setSavingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const [existingMapping, setExistingMapping] = useState<any>(null);

  useEffect(() => {
    if (id && courseId) {
      loadCourseData();
      if (activeTab === 'report') {
        loadCustomReport();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, courseId, activeTab]);

  const loadCourseData = async () => {
    try {
      setLoading(true);

      const coursesData = await getInstanceCourses(Number(id));
      const courseData = coursesData.find((c: MoodleCourse) => c.id === Number(courseId));
      setCourse(courseData || null);

      const usersData = await getCourseUsers(Number(id), Number(courseId));
      setUsers(usersData);
    } catch (err: any) {
      setError('Errore nel caricamento dei dati del corso');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomReport = async () => {
    setLoadingReport(true);
    try {
      // Prima verifica se esiste un mapping
      try {
        const mapping = await getCourseReport(Number(id), Number(courseId));
        setExistingMapping(mapping);
        // Se esiste, carica i dati del report
        const result = await getCourseCustomReport(Number(id), Number(courseId));
        setReportData(result.data || []);
      } catch (mappingError: any) {
        if (mappingError.response?.status === 404) {
          // Nessun mapping configurato
          setExistingMapping(null);
          setReportData([]);
        } else {
          throw mappingError;
        }
      }
    } catch (error: any) {
      console.error('Error loading report:', error);
      setReportData([]);
    } finally {
      setLoadingReport(false);
    }
  };

  const saveReportConfig = async () => {
    setSavingReport(true);
    setReportError('');
    try {
      const reportId = parseInt(reportConfig.report_id);
      if (isNaN(reportId) || reportId < 1) {
        setReportError('Report ID deve essere un numero valido');
        return;
      }

      if (existingMapping) {
        // Update
        await updateCourseReport(Number(id), Number(courseId), {
          report_id: reportId,
          notes: reportConfig.notes
        });
      } else {
        // Create
        await createCourseReport(Number(id), {
          course_id: Number(courseId),
          report_id: reportId,
          notes: reportConfig.notes
        });
      }

      setShowReportConfig(false);
      setReportConfig({ report_id: '', notes: '' });
      loadCustomReport();
    } catch (error: any) {
      setReportError(error.response?.data?.detail || 'Errore nel salvataggio');
    } finally {
      setSavingReport(false);
    }
  };

  const deleteReportConfig = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare la configurazione del report?')) {
      return;
    }
    
    setSavingReport(true);
    try {
      await deleteCourseReport(Number(id), Number(courseId));
      setExistingMapping(null);
      setShowReportConfig(false);
      setReportConfig({ report_id: '', notes: '' });
      setReportData([]);
    } catch (error: any) {
      setReportError(error.response?.data?.detail || 'Errore nella cancellazione');
    } finally {
      setSavingReport(false);
    }
  };

  const downloadReportCSV = () => {
    if (reportData.length === 0) return;

    // Estrai tutte le chiavi (colonne) dal primo record
    const headers = Object.keys(reportData[0]);
    
    // Crea intestazioni CSV
    const csvHeaders = headers.join(',');
    
    // Crea righe CSV
    const csvRows = reportData.map(row => {
      return headers.map(header => {
        const value = row[header]?.toString() || '';
        // Escape virgole e virgolette
        const escaped = value.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',');
    });
    
    // Combina tutto
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    // Crea blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${course?.shortname}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return <div>Corso non trovato</div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate(`/instances/${id}`)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Torna ai corsi</span>
      </button>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <BookOpen className="text-blue-600" size={32} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{course.fullname}</h1>
            <p className="text-gray-500">{course.shortname}</p>
            <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
              <span>Inizio: {new Date(course.startdate * 1000).toLocaleDateString('it-IT')}</span>
              <span>•</span>
              <span>Fine: {new Date(course.enddate * 1000).toLocaleDateString('it-IT')}</span>
              <span>•</span>
              <span className={course.visible ? 'text-green-600' : 'text-gray-500'}>
                {course.visible ? 'Visibile' : 'Nascosto'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users size={18} />
                <span>Iscritti ({users.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'report'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText size={18} />
                <span>Report Custom</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'certificates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Award size={18} />
                <span>Certificati</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Iscritti al corso</h3>
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nessun iscritto</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstname} {user.lastname}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Dettagli
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'report' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Report Configurabile</h3>
                {!loadingReport && !showReportConfig && (
                  <button
                    onClick={() => {
                      if (existingMapping) {
                        setReportConfig({
                          report_id: existingMapping.report_id.toString(),
                          notes: existingMapping.notes || ''
                        });
                      }
                      setShowReportConfig(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Settings size={18} />
                    <span>{existingMapping ? 'Modifica Report' : 'Configura Report'}</span>
                  </button>
                )}
              </div>

              {showReportConfig ? (
                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">
                      {existingMapping ? 'Modifica Report Custom' : 'Configura Report Custom'}
                    </h4>
                    {existingMapping && (
                      <button
                        onClick={deleteReportConfig}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Elimina configurazione
                      </button>
                    )}
                  </div>
                  {reportError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
                      {reportError}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Report ID Moodle *
                      </label>
                      <input
                        type="number"
                        value={reportConfig.report_id}
                        onChange={(e) => setReportConfig({ ...reportConfig, report_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Es: 1"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Trova il Report ID aprendo il report in Moodle e controllando l'URL: viewreport.php?id=X
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note (opzionale)
                      </label>
                      <input
                        type="text"
                        value={reportConfig.notes}
                        onChange={(e) => setReportConfig({ ...reportConfig, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Es: Report AGENAS"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={saveReportConfig}
                        disabled={savingReport}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingReport ? 'Salvataggio...' : (existingMapping ? 'Aggiorna' : 'Salva')}
                      </button>
                      <button
                        onClick={() => {
                          setShowReportConfig(false);
                          setReportConfig({ report_id: '', notes: '' });
                          setReportError('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                </div>
              ) : loadingReport ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Caricamento report...</p>
                </div>
              ) : reportData.length > 0 ? (
                <>
                  <div className="mb-4 flex justify-end">
                    <button
                      onClick={downloadReportCSV}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Scarica CSV completo</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professione</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status AGENAS</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punteggio</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Esito</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completamento</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {row.nome} {row.cognome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {row.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {row.professione}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                row.agenasstatus?.includes('Reclutato')
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {row.agenasstatus || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {row.punteggio}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                row.esitocorso === 'SUPERATO'
                                  ? 'bg-green-100 text-green-800'
                                  : row.esitocorso === 'NON_SUPERATO'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {row.esitocorso}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {row.statocompletamento}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Nessun report configurato per questo corso</p>
                  <p className="text-sm text-gray-400">Clicca su "Configura Report" per iniziare</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Certificati Emessi</h3>
              <p className="text-gray-500">Certificati in sviluppo...</p>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          instanceId={Number(id)}
          courseId={Number(courseId)}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};
