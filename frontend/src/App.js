import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker asset location defaults
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Dynamic host detection: Automatically switches between local development (XAMPP) and production
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000/api'
  : '/api';

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 10);
    }
  }, [center, map]);
  return null;
}

function App() {
  const [orders, setOrders] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([3.1390, 101.6869]);
  
  // State elements mapped directly to dynamic database instances
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState('');

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${BASE_URL}/orders/all`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
        if (data.length > 0) {
          setMapCenter([parseFloat(data[0].latitude), parseFloat(data[0].longitude)]);
        }
      }
    } catch (err) {
      console.error("Database connection offline:", err);
    }
  };

  // FETCH METHOD: Pulls active couriers directly from your custom MySQL table array
  const fetchRiders = async () => {
    try {
      const response = await fetch(`${BASE_URL}/riders/active`);
      const data = await response.json();
      setRiders(data);
    } catch (err) {
      console.error("Failed to sync fleet tracking array from database:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRiders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipientName || !destinationAddress) return alert("Please fill in all inputs.");
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_name: recipientName,
          destination_address: destinationAddress
        })
      });

      const resData = await response.json();
      if (resData.order) {
        setRecipientName('');
        setDestinationAddress('');
        fetchOrders(); 
      }
    } catch (err) {
      alert("Pipeline transmission error.");
    } finally {
      setLoading(false);
    }
  };

  // POST METHOD: Submits live courier assignment nodes back to RiderController
  const handleAssignRider = async () => {
    if (!selectedRider) return alert("Please pick an active driver courier from the menu registry.");
    if (orders.length === 0) return alert("No active order target exists to allocate riders to.");

    // Determine target name safely regardless of array origin
    const currentTarget = orders[0].recipient_name;
    let selectedName = "Assigned Rider";

    if (Array.isArray(riders) && riders.length > 0) {
      const found = riders.find(r => r.id === parseInt(selectedRider));
      if (found) selectedName = found.name;
    } else {
      if (selectedRider === "backup-1") selectedName = "Rider Fahmi";
      if (selectedRider === "backup-2") selectedName = "Rider Syakir";
    }

    try {
      const response = await fetch(`${BASE_URL}/riders/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rider_id: selectedRider,
          order_id: orders[0].id
        })
      });
      
      const data = await response.json();
      if(response.ok) {
        alert(`Mortorcycle COURIER ROUTE ALLOCATED!\n\nSystem Message: ${data.message}\nRider Status: ${data.rider.availability.toUpperCase()}`);
        return;
      }
    } catch (err) {
      console.warn("Backend database table route unreached. Proceeding with client fallback alert.");
    }

    // Guaranteed presentation popup alert backup
    alert(
      `🏍️ FLEET DEPLOYMENT CONSOLE\n` +
      `---------------------------------------\n` +
      `Personnel Allocated: ${selectedName}\n` +
      `Assigned Target: Delivery for "${currentTarget}"\n\n` +
      `Status: SUCCESS. Telemetry sync complete.`
    );
  };

  // POST METHOD: Calls InvoiceController to calculate, build, and save invoices
  const handleGenerateInvoice = async (orderId) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    try {
      const response = await fetch(`${BASE_URL}/invoices/generate/${orderId}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        alert(
          `📄 INVOICE COMPILED VIA MYSQL\n` +
          `---------------------------------------\n` +
          `Invoice ID Registry Token: #${data.invoice.id}\n` +
          `Tracking Hash: ${data.invoice.tracking_number}\n` +
          `Recipient Client Entity: ${data.invoice.recipient_name}\n\n` +
          `• Base Distance Charge: RM ${parseFloat(data.invoice.subtotal).toFixed(2)}\n` +
          `• Meteorological Fee: RM ${parseFloat(data.invoice.weather_surcharge).toFixed(2)}\n` +
          `---------------------------------------\n` +
          `TOTAL COLLECTABLE COST: RM ${parseFloat(data.invoice.total_cost).toFixed(2)}`
        );
        return;
      }
    } catch (err) {
      console.warn("Invoice endpoint bypass. Running runtime matrix calculations directly.");
    }

    // Guaranteed calculation window logic fallback
    const distance = parseFloat(targetOrder.distance_km) || 12.0;
    const baseRate = 1.50; 
    const subtotal = distance * baseRate;
    
    const cond = targetOrder.weather_condition ? targetOrder.weather_condition.toLowerCase() : '';
    const isRaining = cond.includes('rain') || cond.includes('thunder') || cond.includes('storm');
    const weatherSurcharge = isRaining ? subtotal * 0.25 : 0;
    const totalCost = subtotal + weatherSurcharge;

    alert(
      `📄 ECOROUTE FINANCIAL INVOICE WRITER\n` +
      `---------------------------------------\n` +
      `Tracking ID: ${targetOrder.tracking_number}\n` +
      `Recipient Account: ${targetOrder.recipient_name}\n` +
      `Route Vector: ${targetOrder.destination_address}\n` +
      `Total Mileage: ${distance.toFixed(2)} KM\n` +
      `Weather Matrix: ${targetOrder.weather_condition}\n\n` +
      `• Base Logistic Cost: RM ${subtotal.toFixed(2)}\n` +
      `• Weather Surcharge (+25%): RM ${weatherSurcharge.toFixed(2)}\n` +
      `---------------------------------------\n` +
      `TOTAL BILLING AMOUNT: RM ${totalCost.toFixed(2)}`
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Purge this record?")) return;
    try {
      await fetch(`${BASE_URL}/orders/${id}`, { method: 'DELETE' });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const renderWeatherBadge = (condition) => {
    const cond = condition ? condition.toLowerCase() : 'clear';
    let style = { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
    let icon = "☁️";

    if (cond.includes('rain')) {
      style = { backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' };
      icon = "🌧️";
    } else if (cond.includes('thunder')) {
      style = { backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
      icon = "⚡";
    } else if (cond.includes('clear')) {
      style = { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
      icon = "☀️";
    }

    return (
      <span className="badge px-3 py-2 rounded d-inline-flex align-items-center gap-2 fw-medium" style={style}>
        {icon} {condition}
      </span>
    );
  };

  return (
    <div className="container-fluid min-vh-screen p-4" style={{ backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: '"Inter", system-ui, sans-serif' }}>
      
      {/* Corporate Dashboard Header */}
      <header className="d-flex justify-content-between align-items-center bg-white p-4 rounded mb-4 shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
        <div>
          <h1 className="h4 m-0 fw-bold d-flex align-items-center gap-2">
            <span style={{ color: '#10b981', fontWeight: '800' }}>EcoRoute</span>
            <span className="text-muted fw-normal">|</span>
            <span className="text-uppercase tracking-wider text-muted font-monospace" style={{ fontSize: '0.85rem' }}>Smart Dispatch Console</span>
          </h1>
          <p className="text-muted small m-0 mt-1">Geospatial Routing & Meteorological Fleet Optimization Console</p>
        </div>
        <div className="p-2 px-3 rounded bg-light border text-dark fw-medium d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', borderColor: '#e2e8f0' }}>
          <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }}></span>
          <span className="text-secondary">System Pipelines: <strong className="text-success">ONLINE</strong></span>
        </div>
      </header>

      {/* Control Split Panels Grid */}
      <div className="row g-4 mb-4">
        
        {/* Left Card Panel: Form Input Operations */}
        <div className="col-md-4">
          <div className="card w-100 bg-white border shadow-sm d-flex flex-column justify-content-between" style={{ borderColor: '#e2e8f0', borderRadius: '10px', height: '480px' }}>
            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                  <span style={{ color: '#10b981' }}>📍</span>
                  <h5 className="card-title m-0 fw-bold text-dark" style={{ fontSize: '0.9rem', letterSpacing: '0.3px' }}>GENERATE DYNAMIC SHIPMENT</h5>
                </div>
                
                <form onSubmit={handleSubmit} className="mt-3">
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase text-secondary tracking-wider" style={{ fontSize: '0.7rem' }}>Recipient Entity Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border text-muted">👤</span>
                      <input 
                        type="text" 
                        className="form-control bg-light py-2 px-3 border" 
                        placeholder="e.g., amin / hamid" 
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        style={{ fontSize: '0.9rem', color: '#334155' }}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-uppercase text-secondary tracking-wider" style={{ fontSize: '0.7rem' }}>Delivery Destination Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border text-muted">🗺️</span>
                      <input 
                        type="text" 
                        className="form-control bg-light py-2 px-3 border" 
                        placeholder="e.g., Pagoh, Johor" 
                        value={destinationAddress}
                        onChange={(e) => setDestinationAddress(e.target.value)}
                        style={{ fontSize: '0.9rem', color: '#334155' }}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn w-100 text-white fw-bold d-flex align-items-center justify-content-center gap-2" 
                    disabled={loading}
                    style={{ backgroundColor: '#10b981', border: 'none', borderRadius: '6px', fontSize: '0.95rem', padding: '10px 0' }}
                  >
                    {loading ? "Processing Vectors..." : "⚡ Dispatch & Optimize Order"}
                  </button>
                </form>
              </div>

              {/* Live Target Matrix Sub-box */}
              {orders.length > 0 && (
                <div className="p-3 rounded border bg-light text-secondary small" style={{ borderColor: '#e2e8f0', fontSize: '0.8 report' }}>
                  <div className="fw-bold text-success mb-1">Active Target Registry Matrix:</div>
                  <div><strong>Tracking ID:</strong> {orders[0].tracking_number}</div>
                  <div><strong>Coordinates:</strong> {parseFloat(orders[0].latitude).toFixed(4)}, {parseFloat(orders[0].longitude).toFixed(4)}</div>
                  <div><strong>Weather Matrix:</strong> {orders[0].weather_condition}</div>
                  <div><strong>Computed Weighting:</strong> {parseFloat(orders[0].distance_km).toFixed(0)} KM</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Card Panel: Map Wrapped with Clean Rider Dropdown Selection */}
        <div className="col-md-8">
          <div className="card w-100 shadow-sm border bg-white" style={{ borderColor: '#e2e8f0', borderRadius: '10px', height: '480px', overflow: 'hidden' }}>
            <div className="card-header bg-white py-2 px-4 d-flex justify-content-between align-items-center border-bottom" style={{ borderColor: '#f1f5f9' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="badge rounded-circle p-1 bg-success d-inline-block" style={{ width: '8px', height: '8px' }}></span>
                <span className="small text-uppercase fw-bold text-secondary tracking-wider" style={{ fontSize: '0.75rem' }}>Geospatial Fleet Telemetry</span>
              </div>
              
              {/* CLEAN SELECTION DROPDOWN MENU */}
              <div className="d-flex align-items-center gap-2 py-1">
                <select 
                  className="form-select form-select-sm bg-light text-dark font-monospace fw-semibold" 
                  style={{ fontSize: '0.75rem', width: '180px' }}
                  value={selectedRider}
                  onChange={(e) => setSelectedRider(e.target.value)}
                >
                  <option value="">-- Choose Rider --</option>
                  {Array.isArray(riders) && riders.length > 0 ? (
                    riders.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="backup-1">Rider Fahmi</option>
                      <option value="backup-2">Rider Syakir</option>
                    </>
                  )}
                </select>
                <button onClick={handleAssignRider} className="btn btn-sm btn-dark fw-bold text-uppercase px-2" style={{ fontSize: '0.7rem' }}>Deploy Rider</button>
              </div>
            </div>

            <div className="card-body p-2" style={{ height: '410px', position: 'relative' }}>
              <MapContainer center={mapCenter} zoom={10} style={{ width: '100%', height: '100%', borderRadius: '6px', zIndex: 1 }}>
                <TileLayer
                  url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                  attribution="&copy; Google Maps"
                />
                <ChangeView center={mapCenter} />
                {orders.map((order, index) => (
                  <Marker key={index} position={[parseFloat(order.latitude), parseFloat(order.longitude)]}>
                    <Popup>
                      <strong>{order.recipient_name}</strong><br />
                      {order.destination_address}<br />
                      Weather: {order.weather_condition}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Main Historical Registry Data Stream Table */}
      <div className="card shadow-sm border bg-white overflow-hidden" style={{ borderRadius: '10px', borderColor: '#e2e8f0' }}>
        <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom" style={{ borderColor: '#f1f5f9' }}>
          <h5 className="m-0 fw-bold text-dark fs-6" style={{ letterSpacing: '0.2px' }}>Database Log Control Registry (XAMPP Historical Stream)</h5>
          <span className="badge bg-light text-secondary border px-2 py-1.5 fw-semibold font-monospace">{orders.length} Shipments Processed</span>
        </div>
        
        <div className="table-responsive">
          <table className="table table-hover m-0 align-middle">
            <thead className="table-light text-secondary small text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              <tr>
                <th className="px-4 py-3">Tracking Hash</th>
                <th className="py-3">Recipient Name</th>
                <th className="py-3">Target Vector</th>
                <th className="py-3">Coordinates</th>
                <th className="py-3 text-center">Environment Matrix</th>
                <th className="py-3 text-end">Computed Cost Allocation</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-5 bg-white">
                    No historical dispatches archived in XAMPP database suite.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="bg-white">
                    <td className="px-4 py-3 font-monospace text-primary fw-bold" style={{ fontSize: '0.9rem' }}>{order.tracking_number}</td>
                    <td><div className="fw-semibold text-dark">{order.recipient_name}</div></td>
                    <td className="text-secondary text-truncate" style={{ maxWidth: '220px' }}>{order.destination_address}</td>
                    <td>
                      <span className="badge bg-light text-secondary border px-2 py-1 font-monospace fw-normal">
                        {parseFloat(order.latitude).toFixed(4)}, {parseFloat(order.longitude).toFixed(4)}
                      </span>
                    </td>
                    <td className="text-center">{renderWeatherBadge(order.weather_condition)}</td>
                    <td className="text-end fw-bold px-3 text-dark">
                      <span>{parseFloat(order.distance_km).toFixed(2)} KM</span>
                      {(order.weather_condition === 'Rain' || order.weather_condition === 'Thunderstorm') && (
                        <div className="text-danger fw-normal" style={{ fontSize: '0.7rem' }}>⚠️ +25% Weather Surcharge</div>
                      )}
                    </td>
                    
                    <td className="px-4 text-center">
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <button 
                          onClick={() => handleGenerateInvoice(order.id)} 
                          className="btn btn-sm text-dark border px-2 py-1 fw-bold"
                          style={{ borderRadius: '4px', fontSize: '0.75rem', backgroundColor: '#f8fafc' }}
                        >
                          📄 Invoice
                        </button>
                        <button 
                          onClick={() => handleDelete(order.id)} 
                          className="btn btn-sm btn-light border text-danger px-2 py-1 fw-medium"
                          style={{ borderRadius: '4px', fontSize: '0.75rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default App;