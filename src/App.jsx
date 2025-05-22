import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';

// Dummy users DB
const usersDB = [
  { email: 'manager@example.com', password: 'manager123', role: 'Manager' },
  { email: 'keeper@example.com', password: 'keeper123', role: 'Store Keeper' },
];

// Context for auth
const AuthContext = createContext();

function useAuth() {
  return useContext(AuthContext);
}

// Auth provider with login/logout & role info
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // On load, try load user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);
  }, []);

  // login function
  function login(email, password) {
    const found = usersDB.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem('user', JSON.stringify(found));
      return true;
    }
    return false;
  }

  // logout function
  function logout() {
    setUser(null);
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Light/Dark mode hook
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [dark]);

  return [dark, setDark];
}

// Protected Route component
function RequireAuth({ children, role }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Navigation Menu component
function NavBar() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useDarkMode();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-gray-200 dark:bg-gray-800 p-4 flex justify-between items-center">
      <div className="space-x-4">
        {user && (
          <>
            <Link className="font-semibold hover:underline" to="/">
              Home
            </Link>
            {(user.role === 'Manager' || user.role === 'Store Keeper') && (
              <Link className="hover:underline" to="/products">
                Products
              </Link>
            )}
            {user.role === 'Manager' && (
              <Link className="hover:underline" to="/dashboard">
                Dashboard
              </Link>
            )}
          </>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <span className="text-sm">{dark ? 'Dark' : 'Light'} Mode</span>
          <input
            type="checkbox"
            checked={dark}
            onChange={() => setDark(!dark)}
            className="toggle toggle-sm"
          />
        </label>
        {user ? (
          <>
            <span className="text-sm font-medium">{user.email} ({user.role})</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

// Login Page
function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        <strong>Test Accounts:</strong><br />
        manager@example.com / manager123 <br />
        keeper@example.com / keeper123
      </p>
    </div>
  );
}

// Dummy products data (local state)
const initialProducts = [
  { id: 1, name: 'Product A', quantity: 10, price: 15.99 },
  { id: 2, name: 'Product B', quantity: 5, price: 9.99 },
];

// Products page (View + Add/Edit)
function Products() {
  const { user } = useAuth();
  const [products, setProducts] = React.useState(initialProducts);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ name: '', quantity: '', price: '' });

  function startAdd() {
    setForm({ name: '', quantity: '', price: '' });
    setEditing('add');
  }

  function startEdit(product) {
    setForm({
      name: product.name,
      quantity: product.quantity,
      price: product.price,
    });
    setEditing(product.id);
  }

  function cancel() {
    setEditing(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function save() {
    if (!form.name || !form.quantity || !form.price) {
      alert('Please fill all fields');
      return;
    }
    if (editing === 'add') {
      const newProduct = {
        id: Date.now(),
        name: form.name,
        quantity: Number(form.quantity),
        price: Number(form.price),
      };
      setProducts(p => [...p, newProduct]);
    } else {
      setProducts(p =>
        p.map(prod =>
          prod.id === editing
            ? { ...prod, name: form.name, quantity: Number(form.quantity), price: Number(form.price) }
            : prod,
        ),
      );
    }
    setEditing(null);
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Products</h2>
      {(user.role === 'Manager' || user.role === 'Store Keeper') && (
        <button
          onClick={startAdd}
          className="mb-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Add Product
        </button>
      )}

      <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-700">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Name</th>
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Quantity</th>
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Price</th>
            {(user.role === 'Manager' || user.role === 'Store Keeper') && (
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{p.name}</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{p.quantity}</td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">${p.price.toFixed(2)}</td>
              {(user.role === 'Manager' || user.role === 'Store Keeper') && (
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {(editing === 'add' || typeof editing === 'number') && (
        <div className="mt-6 p-4 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            {editing === 'add' ? 'Add Product' : 'Edit Product'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <input
              type="number"
              step="0.01"
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="space-x-2">
              <button
                onClick={save}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={cancel}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard only for Manager
function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white dark:bg-gray-900 rounded shadow text-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Dashboard (Manager Only)</h2>
      <p>Welcome, {user.email}! Here are your stats:</p>
      {/* Dummy stats */}
      <ul className="list-disc list-inside mt-4 space-y-2">
        <li>Total Products: 10</li>
        <li>Pending Orders: 3</li>
        <li>Revenue: $5,000</li>
      </ul>
    </div>
  );
}

// Home page
function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded shadow text-center text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-4">Welcome {user.email}!</h1>
      <p>Your role is <strong>{user.role}</strong>.</p>
      <p className="mt-2">Use the navigation menu to explore your dashboard and products.</p>
    </div>
  );
}

// Main app router
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth role="Manager">
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/products"
            element={
              <RequireAuth>
                <Products />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
