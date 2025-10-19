// Static data for Dr. M. Babar Imran website
// Replaces backend database with frontend-only data management

// Initialize data from existing server data or create default structure
const initializeAppData = () => {
    // Default data structure
    const defaultData = {
        feedback: [
            {
                "name": "Sabir",
                "location": "73",
                "rating": 5,
                "text": "ahba",
                "visible": true,
                "id": 5,
                "created_at": "2025-10-13T06:32:10.606Z"
            },
            {
                "name": "hi",
                "location": "hi", 
                "rating": 5,
                "text": "kjdfndnjn",
                "visible": true,
                "id": 4,
                "created_at": "2025-10-13T05:39:45.422Z"
            },
            {
                "name": "test",
                "location": "test",
                "rating": 5,
                "text": "test", 
                "visible": true,
                "id": 3,
                "created_at": "2025-10-13T05:37:35.223Z"
            },
            {
                "id": 2,
                "name": "Kamaran",
                "location": "Kamalia",
                "rating": 4.5,
                "text": "Nice Behaviour",
                "created_at": "2025-10-10T06:24:21.351Z",
                "visible": true
            },
            {
                "id": 1,
                "name": "Abdullah",
                "location": "Lahore",
                "rating": 3.5,
                "text": "doctor has great personality",
                "created_at": "2025-10-10T06:23:58.991Z",
                "visible": true
            }
        ],
        availability: {
            "is_available": true,
            "note": "Out of city",
            "updated_at": "2025-10-09T07:49:59.115Z"
        },
        hospitals: {
            "pinum": {
                "id": "pinum",
                "name": "PINUM Hospital", 
                "address": "PINUM Cancer Hospital, Faisalabad",
                "map_url": "https://maps.google.com",
                "weekly": {
                    "mon": { "enabled": true, "start": "08:00", "end": "14:00" },
                    "tue": { "enabled": true, "start": "08:00", "end": "14:00" },
                    "wed": { "enabled": false, "start": "08:00", "end": "14:00" },
                    "thu": { "enabled": true, "start": "08:00", "end": "14:00" },
                    "fri": { "enabled": true, "start": "08:00", "end": "12:30" },
                    "sat": { "enabled": true, "start": "08:00", "end": "14:00" },
                    "sun": { "enabled": true, "start": "07:15", "end": "14:30" }
                },
                "notes": {
                    "fri": "Administrator work",
                    "sat": "Administrator work"
                },
                "exceptions": []
            },
            "maqsooda": {
                "id": "maqsooda",
                "name": "Maqsooda Zia Hospital",
                "address": "Maqsooda Zia Hospital, Faisalabad",
                "map_url": "https://maps.app.goo.gl/cU9nygR1CJXUJMGr6",
                "weekly": {
                    "mon": { "enabled": true, "start": "15:00", "end": "18:00" },
                    "tue": { "enabled": true, "start": "15:00", "end": "18:00" },
                    "wed": { "enabled": true, "start": "15:00", "end": "18:00" },
                    "thu": { "enabled": true, "start": "15:00", "end": "18:00" },
                    "fri": { "enabled": true, "start": "15:00", "end": "18:00" },
                    "sat": { "enabled": false, "start": "15:00", "end": "18:00" },
                    "sun": { "enabled": false }
                },
                "notes": {},
                "exceptions": []
            }
        },
        messages: [
            {
                "name": "mansoor",
                "phone": "03658585898",
                "email": "kamk@gmail.com",
                "location": "FAI",
                "message": "hi",
                "id": 3,
                "read": false,
                "created_at": "2025-10-13T05:38:08.307Z"
            },
            {
                "id": 2,
                "name": "imran",
                "phone": "03135896859",
                "email": "abc@gmail.com",
                "location": "karachi",
                "message": "hi can we satart the treatment today or \nwant to stay something in the field 1",
                "read": false,
                "created_at": "2025-10-10T05:24:56.297Z"
            },
            {
                "id": 1,
                "name": "Test",
                "phone": "03131759015",
                "email": "test@gmail.com",
                "location": "Kamalia",
                "message": "hi i want to contact along with you can u help me",
                "read": false,
                "created_at": "2025-10-10T05:16:18.482Z"
            }
        ],
        // Admin credentials (stored client-side for demo - not secure for production)
        admin: {
            email: "123@gmail.com",
            password: "123"
        }
    };
    
    // Check if data exists in localStorage, if not initialize with default
    const existingData = localStorage.getItem('doctorAppData');
    if (!existingData) {
        localStorage.setItem('doctorAppData', JSON.stringify(defaultData));
        return defaultData;
    }
    return JSON.parse(existingData);
};

// Data management functions
const DataManager = {
    // Get all data
    getData: () => {
        const data = localStorage.getItem('doctorAppData');
        return data ? JSON.parse(data) : initializeAppData();
    },
    
    // Save data
    saveData: (data) => {
        localStorage.setItem('doctorAppData', JSON.stringify(data));
    },
    
    // Get next ID for a collection
    getNextId: (collection) => {
        const data = DataManager.getData();
        const items = data[collection] || [];
        const maxId = items.reduce((max, item) => Math.max(max, item.id || 0), 0);
        return maxId + 1;
    },
    
    // Feedback operations
    feedback: {
        getAll: (options = {}) => {
            const data = DataManager.getData();
            let items = [...(data.feedback || [])];
            if (options.onlyVisible) {
                items = items.filter(f => f.visible !== false);
            }
            items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const { limit = 100, offset = 0 } = options;
            return items.slice(offset, offset + limit);
        },
        
        create: (feedbackData) => {
            const data = DataManager.getData();
            const feedback = {
                ...feedbackData,
                id: DataManager.getNextId('feedback'),
                created_at: new Date().toISOString()
            };
            data.feedback = data.feedback || [];
            data.feedback.unshift(feedback);
            DataManager.saveData(data);
            return feedback;
        },
        
        update: (id, updates) => {
            const data = DataManager.getData();
            const index = data.feedback.findIndex(f => f.id === parseInt(id));
            if (index >= 0) {
                Object.assign(data.feedback[index], updates);
                DataManager.saveData(data);
                return data.feedback[index];
            }
            return null;
        },
        
        delete: (id) => {
            const data = DataManager.getData();
            const index = data.feedback.findIndex(f => f.id === parseInt(id));
            if (index >= 0) {
                data.feedback.splice(index, 1);
                DataManager.saveData(data);
                return true;
            }
            return false;
        }
    },
    
    // Messages operations
    messages: {
        getAll: (options = {}) => {
            const data = DataManager.getData();
            let items = [...(data.messages || [])];
            const { status = 'all' } = options;
            if (status === 'read') items = items.filter(m => m.read);
            if (status === 'unread') items = items.filter(m => !m.read);
            items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const { limit = 200, offset = 0 } = options;
            return items.slice(offset, offset + limit);
        },
        
        create: (messageData) => {
            const data = DataManager.getData();
            const message = {
                ...messageData,
                id: DataManager.getNextId('messages'),
                read: false,
                created_at: new Date().toISOString()
            };
            data.messages = data.messages || [];
            data.messages.unshift(message);
            DataManager.saveData(data);
            return message;
        },
        
        update: (id, updates) => {
            const data = DataManager.getData();
            const index = data.messages.findIndex(m => m.id === parseInt(id));
            if (index >= 0) {
                Object.assign(data.messages[index], updates);
                DataManager.saveData(data);
                return data.messages[index];
            }
            return null;
        },
        
        delete: (id) => {
            const data = DataManager.getData();
            const index = data.messages.findIndex(m => m.id === parseInt(id));
            if (index >= 0) {
                data.messages.splice(index, 1);
                DataManager.saveData(data);
                return true;
            }
            return false;
        },
        
        markAllRead: () => {
            const data = DataManager.getData();
            if (data.messages) {
                data.messages.forEach(m => m.read = true);
                DataManager.saveData(data);
            }
            return true;
        }
    },
    
    // Availability operations
    availability: {
        get: () => {
            const data = DataManager.getData();
            return data.availability || { 
                is_available: true, 
                note: '', 
                updated_at: new Date().toISOString() 
            };
        },
        
        update: (availabilityData) => {
            const data = DataManager.getData();
            data.availability = { 
                ...availabilityData, 
                updated_at: new Date().toISOString() 
            };
            DataManager.saveData(data);
            return data.availability;
        }
    },
    
    // Hospitals operations
    hospitals: {
        getAll: () => {
            const data = DataManager.getData();
            return data.hospitals || {};
        },
        
        update: (hospitalId, updates) => {
            const data = DataManager.getData();
            if (!data.hospitals || !data.hospitals[hospitalId]) return null;
            Object.assign(data.hospitals[hospitalId], updates);
            DataManager.saveData(data);
            return data.hospitals[hospitalId];
        },
        
        addException: (hospitalId, exception) => {
            const data = DataManager.getData();
            if (!data.hospitals || !data.hospitals[hospitalId]) return null;
            const hospital = data.hospitals[hospitalId];
            hospital.exceptions = hospital.exceptions || [];
            hospital.exceptions = hospital.exceptions.filter(e => e.date !== exception.date);
            hospital.exceptions.push(exception);
            DataManager.saveData(data);
            return exception;
        },
        
        removeException: (hospitalId, date) => {
            const data = DataManager.getData();
            if (!data.hospitals || !data.hospitals[hospitalId]) return false;
            const hospital = data.hospitals[hospitalId];
            if (!hospital.exceptions) return false;
            const beforeCount = hospital.exceptions.length;
            hospital.exceptions = hospital.exceptions.filter(e => e.date !== date);
            if (hospital.exceptions.length < beforeCount) {
                DataManager.saveData(data);
                return true;
            }
            return false;
        }
    },
    
    // Admin operations
    admin: {
        authenticate: (email, password) => {
            const data = DataManager.getData();
            return data.admin && data.admin.email === email && data.admin.password === password;
        }
    }
};

// Initialize data on load
window.addEventListener('DOMContentLoaded', () => {
    initializeAppData();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataManager, initializeAppData };
}