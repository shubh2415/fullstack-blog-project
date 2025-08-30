import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import './Home.css';

const CATEGORIES = ['Tech', 'Lifestyle', 'News', 'General'];

function Home() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // --- NEW: State for category filtering ---
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
    }
  }, [navigate]);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      // --- UPDATE: Build URL with search and category ---
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('q', searchTerm);
      }
      if (activeCategory && activeCategory !== 'All') {
        params.append('category', activeCategory);
      }
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/blogs?${params.toString()}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setBlogs(data.blogs);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchBlogs();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, activeCategory]); // Refetch on search or category change

  return (
    <>
      <Navbar />
      <div className="home-container">
        <header className="home-header">
          <h1>Welcome to MobiBlog</h1>
          <p>Discover stories, thinking, and expertise from writers on any topic.</p>
          <div className="search-bar-container">
            <input 
              type="text"
              placeholder="Search for blogs by title..."
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* --- NEW: Category Filter Buttons --- */}
        <div className="category-filters">
            <button 
                onClick={() => setActiveCategory('All')} 
                className={activeCategory === 'All' ? 'active' : ''}
            >
                All
            </button>
            {CATEGORIES.map(category => (
                <button 
                    key={category} 
                    onClick={() => setActiveCategory(category)} 
                    className={activeCategory === category ? 'active' : ''}
                >
                    {category}
                </button>
            ))}
        </div>

        <main className="blogs-grid">
          {loading ? (
            <p>Loading blogs...</p>
          ) : blogs.length > 0 ? (
            blogs.map((blog) => (
              <Link to={`/blog/${blog.id}`} key={blog.id} className="blog-card">
                <img src={blog.image_url} alt={blog.title} className="card-image" />
                <div className="card-content">
                  <h3>{blog.title}</h3>
                  <p className="snippet">{blog.content_snippet}</p>
                  <div className="card-meta">
                    <span>By {blog.author_name}</span>
                    <span>{blog.pub_date}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>No blogs found for your search or filter.</p>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

export default Home;