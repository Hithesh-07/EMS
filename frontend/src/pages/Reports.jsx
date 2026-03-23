import { useState } from 'react';
import api from '../api/axios';

const Reports = () => {
    const reportCategories = [
        {
            category: "Employee Data",
            icon: "group",
            reports: [
                { id: "employee-master", title: "Employee Master Details", desc: "Complete dump of all active and inactive employees." },
                { id: "department-count", title: "Department-wise Strength", desc: "Total headcount broken down by department and designation." },
                { id: "new-joinings", title: "New Joinings List", desc: "Employees joined within a specific date range." }
            ]
        },
        {
            category: "Compliance & Payroll",
            icon: "account_balance",
            reports: [
                { id: "esi-eligible", title: "ESI Applicable List", desc: "Employees eligible for ESI deductions." },
                { id: "pf-enrolled", title: "PF Enrolled Employees", desc: "List of all PF enrolled staff with UAN details." },
                { id: "salary-components", title: "Basic & Allowance Master", desc: "Breakdown of basic pay and allowances." }
            ]
        },
        {
            category: "Transfers & Exits",
            icon: "sync_alt",
            reports: [
                { id: "transfer-history", title: "Transfer History", desc: "Log of all employee transfers and promotions." },
                { id: "upcoming-retirements", title: "Upcoming Retirements", desc: "Auto-generated list of retirements for next 6 months." },
                { id: "exit-clearances", title: "Pending Clearances", desc: "Employees stuck in exit workflow." }
            ]
        }
    ];

    const [generating, setGenerating] = useState(null);

    const handleDownload = async (reportId, format) => {
        setGenerating(`${reportId}-${format}`);
        try {
            const res = await api.get(`/reports/${reportId}`, { params: { format } });
            if (res.data.success) {
                // If it's JSON, we can alert or log. If it's a file, the backend sends it.
                // In this case, since the backend sends a file for PDF/Excel:
                window.open(`${api.defaults.baseURL}/reports/${reportId}?format=${format}`, '_blank');
            }
        } catch (err) {
            alert("Report generation failed. Please check backend logs.");
        } finally {
            setGenerating(null);
        }
    };

    return (
        <div className="w-full animate-in fade-in max-w-5xl mx-auto">
            <div className="mb-8">
                <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight">Intelligence & Reports</h2>
                <p className="text-on-surface-variant text-sm mt-1">Export HR data in PDF or Excel formats for internal compliance and management review.</p>
            </div>

            <div className="space-y-10">
                {reportCategories.map((cat, idx) => (
                    <div key={idx} className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm ring-1 ring-slate-200/50">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-[#1a4fa0]">
                                <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                            </div>
                            <h3 className="font-headline font-bold text-xl text-slate-800">{cat.category}</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {cat.reports.map(report => (
                                <div key={report.id} className="group border border-slate-200 rounded-2xl p-5 hover:border-[#1a4fa0] hover:shadow-md transition-all flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-1">{report.title}</h4>
                                        <p className="text-xs text-slate-500 mb-6">{report.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleDownload(report.id, 'pdf')}
                                            disabled={generating === `${report.id}-pdf`}
                                            className="flex-1 bg-error-container/40 hover:bg-error-container/80 text-error text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {generating === `${report.id}-pdf` ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>}
                                            Download PDF
                                        </button>
                                        <button 
                                            onClick={() => handleDownload(report.id, 'excel')}
                                            disabled={generating === `${report.id}-excel`}
                                            className="flex-1 bg-success-container/40 hover:bg-success-container/80 text-success text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {generating === `${report.id}-excel` ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">table_chart</span>}
                                            Export Excel
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;
