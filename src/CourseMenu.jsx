import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import img8 from "./images/8.jpg";
import img9 from "./images/9.jpg";
import htmlimg from "./images/htmlimg.jpg";
import cssimg from "./images/cssimg.png";
import react2 from "./images/react2.png";
import nodejs2 from "./images/nodejs2.png";
import ex from "./images/ex.png";
import mongo3 from "./images/mongo3.png";

const CourseMenu = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const uid = user ? user.id : null;
  useEffect(() => {
    // Function to check if 30 minutes have passed
    const checkLoginExpiration = () => {
      const loginTime = localStorage.getItem("loginTime");
      if (loginTime) {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - parseInt(loginTime, 10)) / (1000 * 60); // Convert to minutes
        if (elapsedTime >= 30) { // 30 minutes
          localStorage.clear(); // Clear all localStorage data
          window.location.reload(); // Refresh the page
        }
      }
    };
  
    if (uid) {
      // Store login time if not already stored
      if (!localStorage.getItem("loginTime")) {
        localStorage.setItem("loginTime", Date.now().toString());
      }
  
      // Check expiration every minute
      const interval = setInterval(checkLoginExpiration, 60 * 1000);
  
      return () => clearInterval(interval);
    }
  }, [uid]);
  useEffect(() => {
    const fetchEnrollments = async () => {
      // if (!uid) return;
      try {
        const response = await fetch(`http://localhost:5000/api/enrollment/${uid}`);
        const data = await response.json();
        console.log(data);
        if (data.enrollments) {
          setEnrollments(data.enrollments);
        }
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      const hasReloaded = localStorage.getItem("hasReloaded");
      if (!hasReloaded) {
        localStorage.setItem("hasReloaded", "true");
        window.location.reload();
      }
    }

    fetchEnrollments();
  }, [uid]);

  const courses = [
    { name: "HTML", id: 1, link: "/Htmlv/1" },
    { name: "CSS", id: 3, link: "/Cssv/3" },
    { name: "Java", id: 4, link: "/Javav/4" },
    { name: "Python", id: 5, link: "/Pythonv/5" },
    { name: "ReactJs", id: 6, link: "/reactjsv/6" },
    { name: "NodeJs", id: 7, link: "/nodejsv/7" },
    { name: "Express", id: 8, link: "/expressjsv/8" },
    { name: "Mongo", id: 9, link: "/mongodbv/9" },
  ];

  const getImageForCourse = (courseName) => {
    const images = {
      HTML: htmlimg,
      CSS: cssimg,
      Java: img9,
      Python: img8,
      ReactJs: react2,
      NodeJs: nodejs2,
      Express: ex,
      Mongo: mongo3,
    };
    return images[courseName] || "";
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnrollClick = async (course) => {
    if (!uid) {
      alert("Please log in first to enroll.");
      return;
    }

    const isAlreadyEnrolled = enrollments.some((enrollment) =>
      typeof enrollment.coursename === "string" &&
      enrollment.coursename.replace(/[-\s]/g, "").toLowerCase() === course.name.replace(/[-\s]/g, "").toLowerCase() &&
      enrollment.enrolled?.trim().toUpperCase() === "YES"
    );

    if (isAlreadyEnrolled) {
      alert("You are already enrolled.");
      return;
    }

    const enrollmentData = { name: uid, coursename: course.id, enrolled: "YES" };

    try {
      const response = await fetch("http://localhost:5000/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrollmentData),
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setEnrollments((prev) => [...prev, enrollmentData]);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error enrolling user:", error);
      alert("Error enrolling user. Please try again.");
    }
  };

  return (
    <div className="course-menu">
      <div className="center">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-bar"
          style={{ height: "45px", width: "400px" }}
        />
      </div>

      <div className="course-grid">
        {loading ? (
          <p>Loading courses...</p>
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course) => {
            const isEnrolled = enrollments.some(
              (enrollment) =>
                typeof enrollment.coursename === "string" &&
                enrollment.coursename.replace(/[-\s]/g, "").toLowerCase() === course.name.replace(/[-\s]/g, "").toLowerCase() &&
                enrollment.enrolled?.trim().toUpperCase() === "YES"
            );

            return (
              <div key={course.id} className="course-card">
                <img src={getImageForCourse(course.name)} alt={`${course.name} Course`} className="course-image" />
                <h2>{course.name}</h2>
                <NavLink
                  to={isEnrolled ? `${course.link}/${uid}` : "#"}
                  className="btn22"
                  style={{ marginRight: "3px",borderRadius:"5px",fontSize:"13px" }}
                  onClick={(event) => {
                    if (!isEnrolled) {
                      event.preventDefault();
                      alert("Please enroll first.");
                    }
                  }}
                >
                  {course.name}
                </NavLink>
                <button
                  className="btn22"
                  style={{ backgroundColor: isEnrolled ? "green" : "transparent" ,fontSize:"13px"}}
                  onClick={() => handleEnrollClick(course)}
                  disabled={isEnrolled}
                >
                  {isEnrolled ? "Enrolled" : "Enroll"}
                </button>
              </div>
            );
          })
        ) : (
          <p>No courses found</p>
        )}
      </div>
    </div>
  );
};

export default CourseMenu;
