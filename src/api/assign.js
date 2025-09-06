// All API calls
export const getClasses = async () => {
  try {
    const response = await fetch('/api/classes');
    if (!response.ok) throw new Error('Failed to fetch classes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};

export const getSections = async () => {
  try {
    const response = await fetch('/api/sections');
    if (!response.ok) throw new Error('Failed to fetch sections');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sections:', error);
    throw error;
  }
};

export const getSessions = async () => {
  try {
    const response = await fetch('/api/sessions');
    if (!response.ok) throw new Error('Failed to fetch sessions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

export const getStudents = async (classId, sectionId, sessionId) => {
  try {
    const params = new URLSearchParams({
      classId,
      sectionId,
      sessionId
    });
    
    const response = await fetch(`/api/students?${params}`);
    if (!response.ok) throw new Error('Failed to fetch students');
    return await response.json();
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const assignRfid = async (studentId, rfid) => {
  try {
    const response = await fetch('/api/assign-rfid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId, rfid })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to assign RFID');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error assigning RFID:', error);
    throw error;
  }
};

export const removeRfid = async (studentId) => {
  try {
    const response = await fetch('/api/remove-rfid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove RFID');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error removing RFID:', error);
    throw error;
  }
};