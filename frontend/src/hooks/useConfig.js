import { useState, useEffect } from 'react';

export function useConfig() {
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('uktech_student_config');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse config", e);
            }
        }
        // Default fallback
        return {
            Name: '',
            RollNo: '',
            BranchId: '1',
            CourseBranchDurationId: '6',
            StudentAdmissionId: '',
            SessionYear: '2024',
            StartMonth: '1',
            EndMonth: (new Date().getMonth() + 1).toString(),
            ClassesPerDay: '4'
        };
    });

    useEffect(() => {
        localStorage.setItem('uktech_student_config', JSON.stringify(config));
    }, [config]);

    const updateConfig = (newFormState) => {
        setConfig(newFormState);
    };

    return { config, updateConfig };
}
