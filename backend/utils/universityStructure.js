/**
 * University Structure Configuration
 * Defines the standard faculties, departments, and course structure for the university management system
 */

const universityStructure = {
  faculties: [
    {
      name: 'Faculty of Sciences',
      code: 'SCI',
      description: 'Offers programs in natural sciences, mathematics, and computer science',
      departments: [
        {
          name: 'Department of Mathematics',
          code: 'MTH',
          description: 'Mathematics and statistics education and research',
          courses: [
            { code: 'MTH101', title: 'General Mathematics I', credits: 3, level: 100, semester: 1 },
            { code: 'MTH102', title: 'General Mathematics II', credits: 3, level: 100, semester: 2 },
            { code: 'MTH201', title: 'Linear Algebra I', credits: 3, level: 200, semester: 1 },
            { code: 'MTH202', title: 'Calculus I', credits: 3, level: 200, semester: 1 },
            { code: 'MTH203', title: 'Differential Equations', credits: 3, level: 200, semester: 2 },
            { code: 'MTH301', title: 'Real Analysis', credits: 3, level: 300, semester: 1 },
            { code: 'MTH302', title: 'Complex Analysis', credits: 3, level: 300, semester: 2 },
            { code: 'MTH401', title: 'Functional Analysis', credits: 3, level: 400, semester: 1 },
            { code: 'STA101', title: 'Statistics I', credits: 3, level: 100, semester: 1 },
            { code: 'STA201', title: 'Statistics II', credits: 3, level: 200, semester: 1 }
          ]
        },
        {
          name: 'Department of Physics',
          code: 'PHY',
          description: 'Physics education and research',
          courses: [
            { code: 'PHY101', title: 'General Physics I', credits: 3, level: 100, semester: 1 },
            { code: 'PHY102', title: 'General Physics II', credits: 3, level: 100, semester: 2 },
            { code: 'PHY201', title: 'Classical Mechanics', credits: 3, level: 200, semester: 1 },
            { code: 'PHY202', title: 'Electromagnetism I', credits: 3, level: 200, semester: 2 },
            { code: 'PHY301', title: 'Quantum Mechanics I', credits: 3, level: 300, semester: 1 },
            { code: 'PHY401', title: 'Solid State Physics', credits: 3, level: 400, semester: 1 }
          ]
        },
        {
          name: 'Department of Chemistry',
          code: 'CHM',
          description: 'Chemistry education and research',
          courses: [
            { code: 'CHM101', title: 'General Chemistry I', credits: 3, level: 100, semester: 1 },
            { code: 'CHM102', title: 'General Chemistry II', credits: 3, level: 100, semester: 2 },
            { code: 'CHM201', title: 'Organic Chemistry I', credits: 3, level: 200, semester: 1 },
            { code: 'CHM202', title: 'Inorganic Chemistry', credits: 3, level: 200, semester: 2 },
            { code: 'CHM301', title: 'Physical Chemistry', credits: 3, level: 300, semester: 1 }
          ]
        },
        {
          name: 'Department of Biology',
          code: 'BIO',
          description: 'Biology and life sciences education',
          courses: [
            { code: 'BIO101', title: 'General Biology I', credits: 3, level: 100, semester: 1 },
            { code: 'BIO102', title: 'General Biology II', credits: 3, level: 100, semester: 2 },
            { code: 'BIO201', title: 'Cell Biology', credits: 3, level: 200, semester: 1 },
            { code: 'BIO202', title: 'Genetics', credits: 3, level: 200, semester: 2 }
          ]
        },
        {
          name: 'Department of Computer Science',
          code: 'CSC',
          description: 'Computer science and technology education',
          courses: [
            { code: 'CSC101', title: 'Introduction to Computer Science', credits: 3, level: 100, semester: 1 },
            { code: 'CSC102', title: 'Computer Programming I', credits: 3, level: 100, semester: 2 },
            { code: 'CSC201', title: 'Data Structures', credits: 3, level: 200, semester: 1 },
            { code: 'CSC202', title: 'Computer Programming II', credits: 3, level: 200, semester: 2 },
            { code: 'CSC301', title: 'Database Systems', credits: 3, level: 300, semester: 1 },
            { code: 'CSC401', title: 'Software Engineering', credits: 3, level: 400, semester: 1 }
          ]
        }
      ]
    },
    {
      name: 'Faculty of Engineering',
      code: 'ENG',
      description: 'Engineering education and research',
      departments: [
        {
          name: 'Department of Civil Engineering',
          code: 'CVE',
          description: 'Civil engineering education and research',
          courses: [
            { code: 'CVE101', title: 'Introduction to Civil Engineering', credits: 2, level: 100, semester: 1 },
            { code: 'CVE201', title: 'Engineering Mechanics', credits: 3, level: 200, semester: 1 },
            { code: 'CVE301', title: 'Structural Analysis', credits: 3, level: 300, semester: 1 },
            { code: 'CVE401', title: 'Reinforced Concrete Design', credits: 3, level: 400, semester: 1 }
          ]
        },
        {
          name: 'Department of Mechanical Engineering',
          code: 'MEE',
          description: 'Mechanical engineering education and research',
          courses: [
            { code: 'MEE101', title: 'Introduction to Mechanical Engineering', credits: 2, level: 100, semester: 1 },
            { code: 'MEE201', title: 'Thermodynamics I', credits: 3, level: 200, semester: 1 },
            { code: 'MEE301', title: 'Fluid Mechanics', credits: 3, level: 300, semester: 1 },
            { code: 'MEE401', title: 'Machine Design', credits: 3, level: 400, semester: 1 }
          ]
        },
        {
          name: 'Department of Electrical/Electronics Engineering',
          code: 'EEE',
          description: 'Electrical and electronics engineering education',
          courses: [
            { code: 'EEE101', title: 'Introduction to Electrical Engineering', credits: 2, level: 100, semester: 1 },
            { code: 'EEE201', title: 'Circuit Theory I', credits: 3, level: 200, semester: 1 },
            { code: 'EEE301', title: 'Electronics I', credits: 3, level: 300, semester: 1 },
            { code: 'EEE401', title: 'Power Systems', credits: 3, level: 400, semester: 1 }
          ]
        }
      ]
    },
    {
      name: 'Faculty of Arts',
      code: 'ART',
      description: 'Arts and humanities education',
      departments: [
        {
          name: 'Department of English Language and Literature',
          code: 'ENG',
          description: 'English language and literature education',
          courses: [
            { code: 'ENG101', title: 'Use of English I', credits: 2, level: 100, semester: 1 },
            { code: 'ENG102', title: 'Use of English II', credits: 2, level: 100, semester: 2 },
            { code: 'ENG201', title: 'Introduction to Literature', credits: 3, level: 200, semester: 1 },
            { code: 'ENG301', title: 'African Literature', credits: 3, level: 300, semester: 1 }
          ]
        },
        {
          name: 'Department of History',
          code: 'HIS',
          description: 'History education and research',
          courses: [
            { code: 'HIS101', title: 'Nigerian History', credits: 2, level: 100, semester: 1 },
            { code: 'HIS201', title: 'World History', credits: 3, level: 200, semester: 1 }
          ]
        }
      ]
    },
    {
      name: 'Faculty of Medical Sciences',
      code: 'MED',
      description: 'Medical and health sciences education',
      departments: [
        {
          name: 'Department of Medicine',
          code: 'MED',
          description: 'Medical education and training',
          courses: [
            { code: 'MED101', title: 'Introduction to Medicine', credits: 2, level: 100, semester: 1 },
            { code: 'MED201', title: 'Anatomy I', credits: 3, level: 200, semester: 1 },
            { code: 'MED301', title: 'Physiology I', credits: 3, level: 300, semester: 1 }
          ]
        },
        {
          name: 'Department of Nursing',
          code: 'NUR',
          description: 'Nursing education and training',
          courses: [
            { code: 'NUR101', title: 'Introduction to Nursing', credits: 2, level: 100, semester: 1 },
            { code: 'NUR201', title: 'Fundamentals of Nursing', credits: 3, level: 200, semester: 1 }
          ]
        }
      ]
    },
    {
      name: 'Faculty of Social Sciences',
      code: 'SOC',
      description: 'Social sciences education and research',
      departments: [
        {
          name: 'Department of Psychology',
          code: 'PSY',
          description: 'Psychology education and research',
          courses: [
            { code: 'PSY101', title: 'Introduction to Psychology', credits: 3, level: 100, semester: 1 },
            { code: 'PSY201', title: 'Developmental Psychology', credits: 3, level: 200, semester: 1 }
          ]
        },
        {
          name: 'Department of Sociology',
          code: 'SOC',
          description: 'Sociology education and research',
          courses: [
            { code: 'SOC101', title: 'Introduction to Sociology', credits: 3, level: 100, semester: 1 },
            { code: 'SOC201', title: 'Social Problems', credits: 3, level: 200, semester: 1 }
          ]
        }
      ]
    },
    {
      name: 'Faculty of Management Sciences',
      code: 'MGT',
      description: 'Business and management education',
      departments: [
        {
          name: 'Department of Business Administration',
          code: 'BUS',
          description: 'Business administration education',
          courses: [
            { code: 'BUS101', title: 'Introduction to Business', credits: 3, level: 100, semester: 1 },
            { code: 'BUS201', title: 'Principles of Management', credits: 3, level: 200, semester: 1 }
          ]
        },
        {
          name: 'Department of Accounting',
          code: 'ACC',
          description: 'Accounting education and training',
          courses: [
            { code: 'ACC101', title: 'Introduction to Accounting', credits: 3, level: 100, semester: 1 },
            { code: 'ACC201', title: 'Financial Accounting I', credits: 3, level: 200, semester: 1 }
          ]
        }
      ]
    }
  ]
};

// Helper functions for university structure management
const UniversityStructure = {
  /**
   * Get all faculties
   * @returns {Array} List of all faculties
   */
  getFaculties() {
    return universityStructure.faculties;
  },

  /**
   * Get departments by faculty code
   * @param {string} facultyCode - Faculty code
   * @returns {Array} List of departments for the faculty
   */
  getDepartmentsByFaculty(facultyCode) {
    const faculty = universityStructure.faculties.find(f => f.code === facultyCode);
    return faculty ? faculty.departments : [];
  },

  /**
   * Get courses by department code
   * @param {string} departmentCode - Department code
   * @returns {Array} List of courses for the department
   */
  getCoursesByDepartment(departmentCode) {
    for (const faculty of universityStructure.faculties) {
      const department = faculty.departments.find(d => d.code === departmentCode);
      if (department) {
        return department.courses;
      }
    }
    return [];
  },

  /**
   * Get all courses for a faculty
   * @param {string} facultyCode - Faculty code
   * @returns {Array} List of all courses in the faculty
   */
  getAllCoursesByFaculty(facultyCode) {
    const faculty = universityStructure.faculties.find(f => f.code === facultyCode);
    if (!faculty) return [];
    
    let allCourses = [];
    faculty.departments.forEach(dept => {
      allCourses = allCourses.concat(dept.courses);
    });
    return allCourses;
  },

  /**
   * Get course by code
   * @param {string} courseCode - Course code
   * @returns {Object} Course details
   */
  getCourseByCode(courseCode) {
    for (const faculty of universityStructure.faculties) {
      for (const department of faculty.departments) {
        const course = department.courses.find(c => c.code === courseCode);
        if (course) {
          return {
            ...course,
            department: department.name,
            faculty: faculty.name
          };
        }
      }
    }
    return null;
  },

  /**
   * Get faculty by department code
   * @param {string} departmentCode - Department code
   * @returns {Object} Faculty details
   */
  getFacultyByDepartment(departmentCode) {
    for (const faculty of universityStructure.faculties) {
      const department = faculty.departments.find(d => d.code === departmentCode);
      if (department) {
        return faculty;
      }
    }
    return null;
  },

  /**
   * Validate faculty and department codes
   * @param {string} facultyCode - Faculty code
   * @param {string} departmentCode - Department code
   * @returns {boolean} Whether the combination is valid
   */
  validateFacultyDepartment(facultyCode, departmentCode) {
    const faculty = universityStructure.faculties.find(f => f.code === facultyCode);
    if (!faculty) return false;
    
    const department = faculty.departments.find(d => d.code === departmentCode);
    return !!department;
  },

  /**
   * Get standard faculties for initialization
   * @returns {Array} Standard faculties with departments
   */
  getStandardFaculties() {
    return universityStructure.faculties.map(faculty => ({
      name: faculty.name,
      code: faculty.code,
      description: faculty.description,
      establishedDate: new Date('2000-01-01'),
      accreditation: {
        isAccredited: true,
        accreditationBody: 'National Universities Commission',
        accreditationDate: new Date('2015-01-01'),
        expiryDate: new Date('2025-01-01')
      },
      contactInfo: {
        email: `${faculty.code.toLowerCase()}@university.edu`,
        phone: '+234-000-000-0000',
        address: {
          street: 'University Road',
          city: 'University City',
          state: 'State',
          zipCode: '000000',
          country: 'Nigeria'
        }
      }
    }));
  },

  /**
   * Get standard departments for initialization
   * @param {string} facultyCode - Faculty code
   * @returns {Array} Standard departments for the faculty
   */
  getStandardDepartments(facultyCode) {
    const faculty = universityStructure.faculties.find(f => f.code === facultyCode);
    if (!faculty) return [];
    
    return faculty.departments.map(dept => ({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      faculty: facultyCode,
      establishedDate: new Date('2000-01-01'),
      accreditation: {
        isAccredited: true,
        accreditationBody: 'National Universities Commission',
        accreditationDate: new Date('2015-01-01'),
        expiryDate: new Date('2025-01-01')
      },
      contactInfo: {
        email: `${dept.code.toLowerCase()}@${facultyCode.toLowerCase()}.university.edu`,
        phone: '+234-000-000-0000',
        office: 'Department Office',
        building: `${dept.name} Building`
      },
      degreePrograms: [
        {
          name: `Bachelor of Science in ${dept.name.replace('Department of ', '')}`,
          level: 'undergraduate',
          duration: 4,
          totalCredits: 120,
          requirements: [
            'Minimum of 5 credits in SSCE including English and Mathematics',
            'UTME score of at least 180',
            'Post-UTME screening'
          ]
        }
      ]
    }));
  }
};

module.exports = UniversityStructure;
