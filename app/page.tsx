'use client';

import {
  Activity, ArrowDown, ArrowDownLeft, ArrowRight, ArrowUp, ArrowUpRight, Bell, Boxes, BusFront,
  CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp,
  CircleUserRound, Clock3, Command, Download, Ellipsis, FileBarChart2, Fuel, Gauge, LayoutDashboard,
  LocateFixed, MapPin, Menu, Moon, MoreHorizontal, PackageCheck, Plus, Search, Settings2, ShieldCheck,
  SlidersHorizontal, Sun, Truck, UserRound, UsersRound, Wrench, X, Zap,
} from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
type Role = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst';
type Section = 'Dashboard' | 'Vehicles' | 'Drivers' | 'Trips & Dispatch' | 'Maintenance' | 'Expenses & Fuel' | 'Analytics & Reports';

type Vehicle = { id: number; reg: string; model: string; type: 'Truck' | 'Van' | 'Trailer'; maxLoad: number; odometer: number; status: VehicleStatus; cost: number; region: string; efficiency: number };
type Driver = { id: number; name: string; initials: string; license: string; category: string; expiry: string; phone: string; score: number; status: DriverStatus; color: string };
type Trip = { id: string; from: string; to: string; vehicleId: number; driverId: number; weight: number; distance: number; status: TripStatus; eta: string; revenue: number };
type Maintenance = { id: number; vehicleId: number; title: string; date: string; cost: number; status: 'In Progress' | 'Resolved'; mechanic: string };
type FuelLog = { id: number; vehicleId: number; date: string; liters: number; price: number; total: number; distance: number };

const initialVehicles: Vehicle[] = [
  { id: 1, reg: 'TR-2048', model: 'Volvo FH16', type: 'Truck', maxLoad: 24000, odometer: 128430, status: 'On Trip', cost: 142000, region: 'North', efficiency: 3.2 },
  { id: 2, reg: 'TR-3192', model: 'Scania R450', type: 'Truck', maxLoad: 22000, odometer: 96210, status: 'Available', cost: 128500, region: 'West', efficiency: 3.5 },
  { id: 3, reg: 'VN-0821', model: 'Mercedes Sprinter', type: 'Van', maxLoad: 1800, odometer: 54820, status: 'Available', cost: 48200, region: 'Central', efficiency: 8.4 },
  { id: 4, reg: 'TR-1847', model: 'MAN TGX 18.500', type: 'Truck', maxLoad: 18000, odometer: 176320, status: 'In Shop', cost: 115000, region: 'North', efficiency: 3.1 },
  { id: 5, reg: 'TL-7703', model: 'Schmitz Cargobull', type: 'Trailer', maxLoad: 27000, odometer: 83450, status: 'Available', cost: 61500, region: 'East', efficiency: 0 },
  { id: 6, reg: 'VN-1442', model: 'Ford Transit 350', type: 'Van', maxLoad: 1500, odometer: 39670, status: 'Available', cost: 39800, region: 'West', efficiency: 9.1 },
  { id: 7, reg: 'TR-6610', model: 'DAF XF 480', type: 'Truck', maxLoad: 21000, odometer: 205100, status: 'On Trip', cost: 119000, region: 'Central', efficiency: 3.4 },
];

const initialDrivers: Driver[] = [
  { id: 1, name: 'Marcus Reid', initials: 'MR', license: 'DL-8831-4290', category: 'CE', expiry: '2027-04-18', phone: '+1 (555) 018-2440', score: 96, status: 'On Trip', color: 'sage' },
  { id: 2, name: 'Elena Vasquez', initials: 'EV', license: 'DL-1042-7731', category: 'C', expiry: '2026-10-21', phone: '+1 (555) 013-8732', score: 91, status: 'Available', color: 'coral' },
  { id: 3, name: 'Andre Williams', initials: 'AW', license: 'DL-5601-0284', category: 'CE', expiry: '2027-08-03', phone: '+1 (555) 014-3519', score: 88, status: 'On Trip', color: 'blue' },
  { id: 4, name: 'Priya Nair', initials: 'PN', license: 'DL-7744-6502', category: 'C1', expiry: '2025-11-12', phone: '+1 (555) 010-9982', score: 73, status: 'Suspended', color: 'lilac' },
  { id: 5, name: 'Daniel Kim', initials: 'DK', license: 'DL-2018-4310', category: 'CE', expiry: '2027-01-29', phone: '+1 (555) 011-2930', score: 98, status: 'Available', color: 'yellow' },
  { id: 6, name: 'Sofia Bennett', initials: 'SB', license: 'DL-3097-1644', category: 'C', expiry: '2026-10-16', phone: '+1 (555) 016-6031', score: 82, status: 'Off Duty', color: 'mint' },
];

const initialTrips: Trip[] = [
  { id: 'T-24018', from: 'Port of Oakland', to: 'Sacramento DC', vehicleId: 1, driverId: 1, weight: 18400, distance: 87, status: 'Dispatched', eta: '10:42 AM', revenue: 2850 },
  { id: 'T-24017', from: 'San Jose Hub', to: 'Fresno Distribution', vehicleId: 7, driverId: 3, weight: 12600, distance: 151, status: 'Dispatched', eta: '12:15 PM', revenue: 3400 },
  { id: 'T-24016', from: 'Reno Crossdock', to: 'Oakland Terminal', vehicleId: 2, driverId: 2, weight: 9800, distance: 218, status: 'Draft', eta: '—', revenue: 4120 },
  { id: 'T-24015', from: 'Stockton Yard', to: 'San Jose Hub', vehicleId: 6, driverId: 5, weight: 860, distance: 78, status: 'Completed', eta: '8:12 AM', revenue: 1640 },
];

const initialMaintenance: Maintenance[] = [
  { id: 1, vehicleId: 4, title: 'Engine oil & filter service', date: 'Oct 16, 2026', cost: 860, status: 'In Progress', mechanic: 'A. Thompson' },
  { id: 2, vehicleId: 2, title: 'Brake pad replacement', date: 'Oct 14, 2026', cost: 1240, status: 'Resolved', mechanic: 'J. Flores' },
  { id: 3, vehicleId: 1, title: 'Tire rotation · front axle', date: 'Oct 11, 2026', cost: 420, status: 'Resolved', mechanic: 'A. Thompson' },
  { id: 4, vehicleId: 7, title: 'Scheduled inspection', date: 'Oct 09, 2026', cost: 680, status: 'Resolved', mechanic: 'R. Chen' },
];

const initialFuel: FuelLog[] = [
  { id: 1, vehicleId: 1, date: 'Oct 16, 2026', liters: 214, price: 1.42, total: 303.88, distance: 692 },
  { id: 2, vehicleId: 2, date: 'Oct 15, 2026', liters: 186, price: 1.39, total: 258.54, distance: 651 },
  { id: 3, vehicleId: 3, date: 'Oct 15, 2026', liters: 64, price: 1.44, total: 92.16, distance: 538 },
  { id: 4, vehicleId: 6, date: 'Oct 14, 2026', liters: 58, price: 1.41, total: 81.78, distance: 527 },
  { id: 5, vehicleId: 7, date: 'Oct 13, 2026', liters: 192, price: 1.40, total: 268.80, distance: 653 },
];

const navItems: { label: Section; icon: typeof LayoutDashboard }[] = [
  { label: 'Dashboard', icon: LayoutDashboard }, { label: 'Vehicles', icon: Truck }, { label: 'Drivers', icon: UsersRound },
  { label: 'Trips & Dispatch', icon: PackageCheck }, { label: 'Maintenance', icon: Wrench },
  { label: 'Expenses & Fuel', icon: Fuel }, { label: 'Analytics & Reports', icon: FileBarChart2 },
];

const roleAccess: Record<Role, Section[]> = {
  'Fleet Manager': navItems.map((item) => item.label),
  Dispatcher: ['Dashboard', 'Vehicles', 'Drivers', 'Trips & Dispatch'],
  'Safety Officer': ['Dashboard', 'Drivers', 'Vehicles', 'Maintenance'],
  'Financial Analyst': ['Dashboard', 'Expenses & Fuel', 'Analytics & Reports'],
};

const costData = [
  { name: 'Mon', fuel: 4120, maintenance: 980, tolls: 620 }, { name: 'Tue', fuel: 3680, maintenance: 420, tolls: 710 },
  { name: 'Wed', fuel: 4290, maintenance: 1240, tolls: 580 }, { name: 'Thu', fuel: 3860, maintenance: 760, tolls: 660 },
  { name: 'Fri', fuel: 4520, maintenance: 860, tolls: 840 }, { name: 'Sat', fuel: 2180, maintenance: 240, tolls: 390 },
  { name: 'Sun', fuel: 1420, maintenance: 0, tolls: 220 },
];

const trendData = [
  { day: '10/10', utilization: 62, trips: 41 }, { day: '10/11', utilization: 58, trips: 38 },
  { day: '10/12', utilization: 69, trips: 49 }, { day: '10/13', utilization: 64, trips: 44 },
  { day: '10/14', utilization: 73, trips: 56 }, { day: '10/15', utilization: 70, trips: 51 },
  { day: '10/16', utilization: 78, trips: 63 },
];

const dateLabel = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const currency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

export default function Home() {
  const [section, setSection] = useState<Section>('Dashboard');
  const [role, setRole] = useState<Role>('Fleet Manager');
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [trips, setTrips] = useState(initialTrips);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [fuelLogs, setFuelLogs] = useState(initialFuel);
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState<'trip' | 'vehicle' | 'maintenance' | 'complete' | null>(null);
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const [vehicleType, setVehicleType] = useState('All types');
  const [vehicleStatus, setVehicleStatus] = useState('All statuses');
  const [region, setRegion] = useState('All regions');
  const [tripTab, setTripTab] = useState<TripStatus>('Dispatched');
  const [tripForm, setTripForm] = useState({ from: '', to: '', distance: '', vehicleId: '', driverId: '', weight: '' });
  const [vehicleForm, setVehicleForm] = useState({ reg: '', model: '', type: 'Truck', maxLoad: '', cost: '', region: 'North' });
  const [maintenanceForm, setMaintenanceForm] = useState({ vehicleId: '', title: '', cost: '' });
  const [completionForm, setCompletionForm] = useState({ tripId: '', odometer: '', fuel: '' });
  const [sortAscending, setSortAscending] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape') setModal(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const permittedSections = roleAccess[role];
  const selectedTripVehicle = vehicles.find((vehicle) => vehicle.id === Number(tripForm.vehicleId));
  const selectedTripDriver = drivers.find((driver) => driver.id === Number(tripForm.driverId));
  const overweight = Boolean(selectedTripVehicle && Number(tripForm.weight) > selectedTripVehicle.maxLoad);
  const expiredLicense = Boolean(selectedTripDriver && new Date(`${selectedTripDriver.expiry}T23:59:59`) < new Date());
  const dispatchBlocked = !tripForm.from || !tripForm.to || !tripForm.vehicleId || !tripForm.driverId || !tripForm.weight || overweight || expiredLicense;

  const visibleVehicles = vehicles.filter((vehicle) => {
    const matchesQuery = `${vehicle.reg} ${vehicle.model} ${vehicle.type}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (vehicleType === 'All types' || vehicle.type === vehicleType) && (vehicleStatus === 'All statuses' || vehicle.status === vehicleStatus) && (region === 'All regions' || vehicle.region === region);
  }).sort((a, b) => sortAscending ? a.odometer - b.odometer : b.odometer - a.odometer);
  const activeTrips = trips.filter((trip) => trip.status === 'Dispatched');
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === 'Available');
  const availableDrivers = drivers.filter((driver) => driver.status === 'Available' && new Date(`${driver.expiry}T23:59:59`) >= new Date());
  const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.total, 0);
  const totalMaintenanceCost = maintenance.reduce((sum, log) => sum + log.cost, 0);
  const visibleDrivers = drivers.filter((driver) => `${driver.name} ${driver.license}`.toLowerCase().includes(query.toLowerCase()));
  const sectionSubtitle: Record<Section, string> = {
    Dashboard: 'Your fleet, in motion.', Vehicles: 'Every vehicle. One clear view.', Drivers: 'People first. Safety always.',
    'Trips & Dispatch': 'Keep every delivery moving.', Maintenance: 'Service that keeps you on the road.',
    'Expenses & Fuel': 'Know where every dollar goes.', 'Analytics & Reports': 'Operational clarity, at a glance.',
  };

  const changeSection = (next: Section) => {
    setSection(next);
    setQuery('');
    setSidebarOpen(false);
  };

  const dispatchTrip = (event: FormEvent) => {
    event.preventDefault();
    if (dispatchBlocked || !selectedTripVehicle || !selectedTripDriver) return;
    const trip: Trip = {
      id: `T-${24019 + trips.length}`, from: tripForm.from, to: tripForm.to, vehicleId: selectedTripVehicle.id,
      driverId: selectedTripDriver.id, weight: Number(tripForm.weight), distance: Number(tripForm.distance || 0),
      status: 'Dispatched', eta: 'Calculating', revenue: Math.round(Number(tripForm.distance || 0) * 18),
    };
    setTrips((current) => [trip, ...current]);
    setVehicles((current) => current.map((vehicle) => vehicle.id === selectedTripVehicle.id ? { ...vehicle, status: 'On Trip' } : vehicle));
    setDrivers((current) => current.map((driver) => driver.id === selectedTripDriver.id ? { ...driver, status: 'On Trip' } : driver));
    setTripForm({ from: '', to: '', distance: '', vehicleId: '', driverId: '', weight: '' });
    setModal(null);
    flash(`Trip ${trip.id} dispatched. ${selectedTripVehicle.reg} is on the move.`);
  };

  const cancelTrip = (trip: Trip) => {
    if (trip.status !== 'Dispatched') return;
    setTrips((current) => current.map((item) => item.id === trip.id ? { ...item, status: 'Cancelled' } : item));
    setVehicles((current) => current.map((vehicle) => vehicle.id === trip.vehicleId ? { ...vehicle, status: 'Available' } : vehicle));
    setDrivers((current) => current.map((driver) => driver.id === trip.driverId ? { ...driver, status: 'Available' } : driver));
    flash(`${trip.id} cancelled. Vehicle and driver are available again.`);
  };

  const completeTrip = (event: FormEvent) => {
    event.preventDefault();
    const trip = trips.find((item) => item.id === completionForm.tripId);
    if (!trip) return;
    const vehicle = vehicles.find((item) => item.id === trip.vehicleId);
    setTrips((current) => current.map((item) => item.id === trip.id ? { ...item, status: 'Completed' } : item));
    setVehicles((current) => current.map((item) => item.id === trip.vehicleId ? { ...item, status: 'Available', odometer: Math.max(item.odometer, Number(completionForm.odometer || item.odometer)) } : item));
    setDrivers((current) => current.map((item) => item.id === trip.driverId ? { ...item, status: 'Available' } : item));
    if (Number(completionForm.fuel) > 0 && vehicle) {
      setFuelLogs((current) => [{ id: Date.now(), vehicleId: vehicle.id, date: 'Oct 16, 2026', liters: Number(completionForm.fuel), price: 1.42, total: Number(completionForm.fuel) * 1.42, distance: trip.distance }, ...current]);
    }
    setModal(null);
    flash(`${trip.id} completed. Crew and vehicle returned to available.`);
  };

  const addVehicle = (event: FormEvent) => {
    event.preventDefault();
    if (vehicles.some((vehicle) => vehicle.reg.toLowerCase() === vehicleForm.reg.trim().toLowerCase())) {
      flash('That registration number is already in the fleet.');
      return;
    }
    const vehicle: Vehicle = { id: Date.now(), reg: vehicleForm.reg.toUpperCase(), model: vehicleForm.model, type: vehicleForm.type as Vehicle['type'], maxLoad: Number(vehicleForm.maxLoad), odometer: 0, status: 'Available', cost: Number(vehicleForm.cost), region: vehicleForm.region, efficiency: 0 };
    setVehicles((current) => [...current, vehicle]);
    setModal(null);
    setVehicleForm({ reg: '', model: '', type: 'Truck', maxLoad: '', cost: '', region: 'North' });
    flash(`${vehicle.reg} added to the fleet.`);
  };

  const logMaintenance = (event: FormEvent) => {
    event.preventDefault();
    const vehicleId = Number(maintenanceForm.vehicleId);
    if (!vehicleId || !maintenanceForm.title) return;
    const item: Maintenance = { id: Date.now(), vehicleId, title: maintenanceForm.title, date: 'Oct 16, 2026', cost: Number(maintenanceForm.cost || 0), status: 'In Progress', mechanic: 'Unassigned' };
    setMaintenance((current) => [item, ...current]);
    setVehicles((current) => current.map((vehicle) => vehicle.id === vehicleId ? { ...vehicle, status: 'In Shop' } : vehicle));
    setModal(null);
    flash('Maintenance logged. Vehicle status changed to In Shop.');
  };

  const resolveMaintenance = (item: Maintenance) => {
    setMaintenance((current) => current.map((log) => log.id === item.id ? { ...log, status: 'Resolved' } : log));
    const hasAnotherOpen = maintenance.some((log) => log.id !== item.id && log.vehicleId === item.vehicleId && log.status === 'In Progress');
    if (!hasAnotherOpen) setVehicles((current) => current.map((vehicle) => vehicle.id === item.vehicleId ? { ...vehicle, status: 'Available' } : vehicle));
    flash(`${vehicleFor(item.vehicleId)?.reg ?? 'Vehicle'} maintenance resolved.`);
  };

  const vehicleFor = (id: number) => vehicles.find((vehicle) => vehicle.id === id);
  const driverFor = (id: number) => drivers.find((driver) => driver.id === id);

  const exportCsv = () => {
    const rows = [['Registration', 'Model', 'Type', 'Capacity (kg)', 'Odometer (km)', 'Status', 'Acquisition Cost'], ...vehicles.map((vehicle) => [vehicle.reg, vehicle.model, vehicle.type, vehicle.maxLoad, vehicle.odometer, vehicle.status, vehicle.cost])];
    const content = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type: 'text/csv' }));
    link.download = 'transitops-fleet-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    flash('Fleet report downloaded as CSV.');
  };

  const tableHead = (columns: string[]) => <div className="table-head" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>{columns.map((column) => <span key={column}>{column}</span>)}</div>;

  const renderVehicles = (compact = false) => <div className="table-wrap">
    {tableHead(compact ? ['Vehicle', 'Model & type', 'Odometer', 'Status'] : ['Vehicle', 'Model & type', 'Max load', 'Odometer', 'Status', 'Acquisition cost', ''])}
    {visibleVehicles.length ? visibleVehicles.map((vehicle) => <div className={`vehicle-row ${compact ? 'compact' : ''}`} key={vehicle.id} style={{ gridTemplateColumns: compact ? '1.2fr 1.3fr 1fr .9fr' : '1.05fr 1.25fr .8fr .8fr .75fr .95fr 36px' }}>
      <div><span className="reg-tag">{vehicle.reg}</span><span className="mobile-caption">{vehicle.region} region</span></div>
      <div className="model-cell"><strong>{vehicle.model}</strong><span>{vehicle.type}</span></div>
      {!compact && <span className="tabular">{vehicle.maxLoad.toLocaleString()} kg</span>}
      <span className="tabular">{vehicle.odometer.toLocaleString()} km</span>
      <StatusBadge status={vehicle.status} />
      {!compact && <strong className="tabular">{currency(vehicle.cost)}</strong>}
      {!compact && <button className="icon-button row-menu" title={`More actions for ${vehicle.reg}`} onClick={() => flash(`${vehicle.reg} · ${vehicle.model} · ${vehicle.odometer.toLocaleString()} km`)}><MoreHorizontal size={17} /></button>}
    </div>) : <EmptyState icon={Truck} title="No vehicles match" detail="Try adjusting the filters or search term." />}
  </div>;

  const renderTrips = (list = trips.filter((trip) => trip.status === tripTab)) => <div className="table-wrap">
    {tableHead(['Trip ID', 'Route', 'Vehicle / driver', 'Cargo', 'ETA', 'Status', ''])}
    {list.length ? list.map((trip) => <div className="trip-row" key={trip.id}>
      <strong className="trip-id">{trip.id}</strong>
      <div className="route-cell"><strong>{trip.from}</strong><span><span className="route-line" />{trip.to}</span></div>
      <div className="model-cell"><strong>{vehicleFor(trip.vehicleId)?.reg ?? '—'}</strong><span>{driverFor(trip.driverId)?.name ?? '—'}</span></div>
      <span className="tabular">{trip.weight.toLocaleString()} kg</span><span>{trip.eta}</span><StatusBadge status={trip.status} />
      <div className="trip-actions">{trip.status === 'Dispatched' && <><button className="text-action" onClick={() => { setCompletionForm({ tripId: trip.id, odometer: String((vehicleFor(trip.vehicleId)?.odometer ?? 0) + trip.distance), fuel: '' }); setModal('complete'); }}>Complete</button><button className="icon-button" title="Cancel trip" onClick={() => cancelTrip(trip)}><X size={15} /></button></>}</div>
    </div>) : <EmptyState icon={PackageCheck} title={`No ${tripTab.toLowerCase()} trips`} detail="Trips will appear here as your dispatch team updates them." />}
  </div>;

  const renderDrivers = () => <div className="table-wrap">
    {tableHead(['Driver', 'License & category', 'License expiry', 'Contact', 'Safety score', 'Status'])}
    {visibleDrivers.length ? visibleDrivers.map((driver) => {
      const daysUntil = Math.ceil((new Date(`${driver.expiry}T23:59:59`).getTime() - new Date().getTime()) / 86400000);
      return <div className="driver-row" key={driver.id}>
        <div className="driver-identity"><Avatar driver={driver} /><strong>{driver.name}</strong></div>
        <div className="model-cell"><strong>{driver.license}</strong><span>Class {driver.category}</span></div>
        <div className="expiry-cell"><strong className={daysUntil <= 30 ? 'text-danger' : ''}>{dateLabel(driver.expiry)}</strong>{daysUntil < 0 ? <span className="expiry-pill danger">Expired</span> : daysUntil <= 7 ? <span className="expiry-pill warning">{daysUntil === 0 ? 'Expires today' : `In ${daysUntil} days`}</span> : null}</div>
        <span className="phone-text">{driver.phone}</span><span className={`score-pill ${driver.score < 80 ? 'score-low' : ''}`}><ShieldCheck size={14} />{driver.score}</span><StatusBadge status={driver.status} />
      </div>;
    }) : <EmptyState icon={UsersRound} title="No drivers found" detail="Try a different name or license number." />}
  </div>;

  const renderMaintenance = () => <div className="table-wrap">
    {tableHead(['Vehicle', 'Issue / service', 'Assigned to', 'Date logged', 'Cost', 'Status', ''])}
    {maintenance.map((item) => <div className="maintenance-row" key={item.id}>
      <div className="maintenance-vehicle"><span className="vehicle-mini-icon"><Truck size={16} /></span><strong>{vehicleFor(item.vehicleId)?.reg ?? '—'}</strong></div>
      <div className="model-cell"><strong>{item.title}</strong><span>{vehicleFor(item.vehicleId)?.model}</span></div>
      <span>{item.mechanic}</span><span>{item.date}</span><strong className="tabular">{currency(item.cost)}</strong><StatusBadge status={item.status} />
      {item.status === 'In Progress' ? <button className="text-action" onClick={() => resolveMaintenance(item)}>Resolve</button> : <span className="resolved-check"><Check size={15} /></span>}
    </div>)}
  </div>;

  const renderFuel = () => <div className="table-wrap">
    {tableHead(['Date', 'Vehicle', 'Distance', 'Liters', 'Cost / liter', 'Total cost'])}
    {fuelLogs.map((log) => <div className="fuel-row" key={log.id}><span>{log.date}</span><strong>{vehicleFor(log.vehicleId)?.reg ?? '—'}</strong><span className="tabular">{log.distance.toLocaleString()} km</span><span className="tabular">{log.liters} L</span><span className="tabular">${log.price.toFixed(2)}</span><strong className="tabular">${log.total.toFixed(2)}</strong></div>)}
  </div>;

  const statusCount = (status: TripStatus) => trips.filter((trip) => trip.status === status).length;
  const livePageTitle = section === 'Dashboard' ? 'Operations overview' : section;

  return <div className={`app-shell ${dark ? 'theme-dark' : ''}`}>
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="brand-row"><div className="brand-mark"><span /><span /><span /></div><div className="brand-copy"><strong>Transit<span>Ops</span></strong><small><i /> Fleet live</small></div><button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <div className="workspace-switcher"><div className="workspace-avatar">N</div><div><strong>Northstar Logistics</strong><span>Enterprise plan</span></div><ChevronDown size={15} /></div>
      <div className="nav-label">OPERATIONS</div>
      <nav className="side-nav" aria-label="Main navigation">{navItems.filter((item) => permittedSections.includes(item.label)).map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${section === label ? 'active' : ''}`} onClick={() => changeSection(label)}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Maintenance' && maintenance.filter((item) => item.status === 'In Progress').length > 0 && <span className="nav-count">{maintenance.filter((item) => item.status === 'In Progress').length}</span>}</button>)}</nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-bottom">
        <button className="nav-item utility-nav" onClick={() => flash('Help center is coming soon.')}><CircleHelp size={18} /><span>Help & support</span></button>
        <div className="role-picker"><div className="role-label">VIEW AS</div><div className="select-wrap"><select aria-label="Switch role" value={role} onChange={(event) => { const nextRole = event.target.value as Role; setRole(nextRole); if (!roleAccess[nextRole].includes(section)) setSection('Dashboard'); flash(`Workspace switched to ${nextRole}.`); }}><option>Fleet Manager</option><option>Dispatcher</option><option>Safety Officer</option><option>Financial Analyst</option></select><ChevronDown size={14} /></div></div>
        <div className="profile-row"><div className="profile-avatar">JM</div><div className="profile-copy"><strong>Jordan Miller</strong><span>{role}</span></div><button className="icon-button profile-menu" title="Profile settings" onClick={() => flash('Profile settings')}><Ellipsis size={18} /></button></div>
        <button className="theme-switch" onClick={() => setDark((current) => !current)} title={`Switch to ${dark ? 'light' : 'dark'} mode`}><span>{dark ? <Moon size={15} /> : <Sun size={15} />}{dark ? 'Dark appearance' : 'Light appearance'}</span><span className={`toggle ${dark ? 'toggle-on' : ''}`}><i /></span></button>
      </div>
      <div className="sidebar-footnote">TRANSITOPS <span>·</span> v2.4.0</div>
    </aside>

    <div className="main-area">
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
        <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{section}</strong></div>
        <div className="topbar-actions">
          <div className="searchbox"><Search size={16} /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything..." aria-label="Search fleet data" /><kbd><Command size={11} /> K</kbd></div>
          <button className="icon-button notification-button" title="Notifications" onClick={() => flash('2 alerts need your attention: license expiry and maintenance due.')}><Bell size={19} /><i /></button>
          <button className="button button-primary top-cta" onClick={() => { if (!['Fleet Manager', 'Dispatcher'].includes(role)) { flash(`${role} does not have dispatch permissions.`); return; } setModal('trip'); }}><Plus size={16} /> New dispatch</button>
        </div>
      </header>

      <main className="content-area">
        <div className="page-heading"><div><div className="eyebrow"><span className="live-dot" /> THURSDAY, OCTOBER 16, 2026 <span className="eyebrow-divider">/</span> NORTH AMERICA</div><h1>{livePageTitle}</h1><p>{sectionSubtitle[section]}</p></div><div className="heading-actions"><button className="button button-secondary" onClick={() => flash('Dashboard refreshed with the latest fleet data.')}><Activity size={15} /> Live data <span className="live-mini-dot" /></button><button className="icon-button filter-button" title="Dashboard preferences" onClick={() => flash('Your dashboard is up to date.')}><Settings2 size={18} /></button></div></div>

        {section === 'Dashboard' && <>
          <section className="kpi-grid" aria-label="Fleet key performance indicators">
            <KpiCard label="Fleet availability" value={`${availableVehicles.length} / ${vehicles.length}`} note="Vehicles ready to dispatch" delta="+4.8%" positive icon={Truck} accent="green" />
            <KpiCard label="In maintenance" value={vehicles.filter((vehicle) => vehicle.status === 'In Shop').length.toString().padStart(2, '0')} note="1 needs your attention" delta="-12.5%" positive icon={Wrench} accent="amber" />
            <KpiCard label="Active deliveries" value={activeTrips.length.toString().padStart(2, '0')} note={`${trips.filter((trip) => trip.status === 'Draft').length} ready to dispatch`} delta="+8.2%" positive icon={PackageCheck} accent="blue" />
            <KpiCard label="Drivers on duty" value={drivers.filter((driver) => ['On Trip', 'Available'].includes(driver.status)).length.toString().padStart(2, '0')} note="Across 4 operating regions" delta="+2.1%" positive icon={UsersRound} accent="violet" />
            <div className="kpi-card utilization-card"><div className="kpi-top"><span>Fleet utilization</span><span className="kpi-icon green"><Gauge size={17} /></span></div><div className="utilization-value">78<span>%</span><div className="utilization-ring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="17" /><circle className="ring-progress" cx="22" cy="22" r="17" /></svg><ArrowUpRight size={14} /></div></div><div className="kpi-bottom"><span>Target: 85%</span><span className="delta positive"><ArrowUpRight size={13} /> 6.4%</span></div><div className="utilization-track"><i /></div></div>
          </section>

          <div className="filter-bar"><div className="filter-intro"><SlidersHorizontal size={15} /><span>Quick filters</span></div><div className="filter-control"><select aria-label="Filter by vehicle type" value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}><option>All types</option><option>Truck</option><option>Van</option><option>Trailer</option></select><ChevronDown size={13} /></div><div className="filter-control"><select aria-label="Filter by vehicle status" value={vehicleStatus} onChange={(event) => setVehicleStatus(event.target.value)}><option>All statuses</option><option>Available</option><option>On Trip</option><option>In Shop</option><option>Retired</option></select><ChevronDown size={13} /></div><div className="filter-control"><select aria-label="Filter by region" value={region} onChange={(event) => setRegion(event.target.value)}><option>All regions</option><option>North</option><option>West</option><option>Central</option><option>East</option></select><ChevronDown size={13} /></div><button className="filter-reset" onClick={() => { setVehicleType('All types'); setVehicleStatus('All statuses'); setRegion('All regions'); }}>Reset</button><span className="filter-results">{visibleVehicles.length} vehicles</span></div>

          <div className="dashboard-grid">
            <section className="panel map-panel"><div className="panel-heading"><div><div className="panel-title-row"><h2>Live fleet activity</h2><span className="panel-live"><i /> LIVE</span></div><p>Real-time vehicle locations across your network</p></div><button className="icon-button" title="View activity" onClick={() => changeSection('Trips & Dispatch')}><ArrowUpRight size={17} /></button></div>
              <div className="map-stage"><div className="map-label label-oakland"><i /> OAKLAND</div><div className="map-label label-sacramento"><i /> SACRAMENTO</div><div className="map-label label-stockton"><i /> STOCKTON</div><div className="map-label label-san-jose"><i /> SAN JOSE</div><svg className="route-map" viewBox="0 0 680 294" preserveAspectRatio="none" aria-hidden="true"><path className="road-major" d="M-10 248 C 104 210, 130 125, 213 142 S 347 223, 402 163 S 510 89, 690 34" /><path className="road-minor" d="M18 50 C110 92 124 200 209 254 M130 -10 C154 52 280 92 314 162 S440 265 502 312 M404 -10 C384 60 488 117 474 193 S540 246 602 310 M-10 188 C106 161 136 65 220 70 S333 115 398 87 S544 111 690 76" /><path className="route-line-map" d="M66 213 C138 184 143 102 233 102 S324 193 407 160 S507 92 610 57" /><path className="route-line-secondary" d="M180 228 C244 213 264 151 327 146 S419 207 510 189" /></svg><span className="map-pin pin-1"><Truck size={14} /></span><span className="map-pin pin-2"><Truck size={14} /></span><span className="map-pin pin-3"><Truck size={14} /></span><span className="map-hub hub-oakland"><i /></span><span className="map-hub hub-sacramento"><i /></span><span className="map-hub hub-stockton"><i /></span><div className="map-zoom"><button aria-label="Zoom in" onClick={() => flash('Map zoomed in.')}><Plus size={14} /></button><button aria-label="Zoom out" onClick={() => flash('Map zoomed out.')}><span>−</span></button></div><div className="map-scale">CALIFORNIA <span>·</span> LIVE ROUTES</div></div>
              <div className="map-footer"><div><span className="map-legend-dot blue-dot" />On route <strong>{activeTrips.length}</strong></div><div><span className="map-legend-dot green-dot" />Available <strong>{availableVehicles.length}</strong></div><div><span className="map-legend-dot amber-dot" />In service <strong>{vehicles.filter((vehicle) => vehicle.status === 'In Shop').length}</strong></div><button className="text-action map-link" onClick={() => changeSection('Trips & Dispatch')}>View dispatch <ArrowRight size={14} /></button></div>
            </section>

            <section className="panel attention-panel"><div className="panel-heading"><div><div className="panel-title-row"><h2>Needs attention</h2><span className="attention-count">2</span></div><p>Items that may need a closer look</p></div><button className="icon-button" title="More attention options" onClick={() => flash('Showing all open alerts.')}><MoreHorizontal size={18} /></button></div><div className="attention-list"><button className="attention-item" onClick={() => changeSection('Drivers')}><span className="attention-icon warning-bg"><CalendarDays size={17} /></span><span className="attention-copy"><strong>License expiring soon</strong><span>Elena Vasquez · Class C</span><small>Expires in 5 days</small></span><ChevronRight size={16} /></button><button className="attention-item" onClick={() => changeSection('Maintenance')}><span className="attention-icon danger-bg"><Wrench size={17} /></span><span className="attention-copy"><strong>Service overdue</strong><span>TR-1847 · Engine service</span><small>2 days overdue</small></span><ChevronRight size={16} /></button><div className="attention-foot"><ShieldCheck size={15} /><span>Fleet compliance is <strong>94%</strong> this week</span><span className="compliance-spark">↗</span></div></div></section>

            <section className="panel performance-panel"><div className="panel-heading"><div><h2>Fleet performance</h2><p>Utilization across the last 7 days</p></div><button className="period-select" onClick={() => flash('Showing the last 7 days.')}>Last 7 days <ChevronDown size={13} /></button></div><div className="performance-summary"><strong>78%</strong><span className="delta positive"><ArrowUpRight size={13} /> 6.4%</span><span className="muted-copy">vs. previous week</span></div><div className="performance-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ top: 7, right: 4, left: -25, bottom: 0 }}><defs><linearGradient id="utilizationFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3e8d77" stopOpacity={0.18} /><stop offset="100%" stopColor="#3e8d77" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e9eeeb" strokeDasharray="3 5" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#929b96', fontSize: 10 }} dy={7} /><YAxis domain={[40, 90]} ticks={[40, 60, 80]} axisLine={false} tickLine={false} tick={{ fill: '#929b96', fontSize: 10 }} tickFormatter={(value) => `${value}%`} /><Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e9e6', fontSize: 12, boxShadow: '0 5px 18px #10271b12' }} formatter={(value) => [`${value}%`, 'Utilization']} /><Area type="monotone" dataKey="utilization" stroke="#347f6c" strokeWidth={2.4} fill="url(#utilizationFill)" activeDot={{ r: 4, fill: '#347f6c', stroke: '#fff', strokeWidth: 2 }} /></AreaChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="legend-line" />Utilization</span><span>Target <strong>85%</strong></span></div></section>

            <section className="panel trips-panel"><div className="panel-heading"><div><h2>Active deliveries</h2><p>{activeTrips.length} vehicles currently on route</p></div><button className="text-action" onClick={() => changeSection('Trips & Dispatch')}>All trips <ArrowRight size={14} /></button></div><div className="delivery-list">{activeTrips.slice(0, 3).map((trip) => <div className="delivery-item" key={trip.id}><div className="delivery-route-indicator"><span /><i /><span /></div><div className="delivery-copy"><strong>{trip.from} <ArrowRight size={12} /> {trip.to}</strong><span>{trip.id} <i /> {vehicleFor(trip.vehicleId)?.reg} · {driverFor(trip.driverId)?.name}</span></div><div className="delivery-eta"><strong>{trip.eta}</strong><span>ETA</span></div></div>)}{activeTrips.length === 0 && <EmptyState icon={Truck} title="No vehicles on route" detail="Dispatched trips will show here." />}</div></section>
          </div>

          <section className="panel fleet-table-panel"><div className="panel-heading"><div><h2>Fleet overview</h2><p>Latest vehicle status across all regions</p></div><div className="panel-tools"><button className="table-search-icon" onClick={() => searchRef.current?.focus()} title="Search fleet"><Search size={15} /></button><button className="text-action" onClick={() => changeSection('Vehicles')}>View fleet <ArrowRight size={14} /></button></div></div>{renderVehicles(true)}</section>
        </>}

        {section === 'Vehicles' && <section className="panel full-panel"><div className="panel-heading section-panel-heading"><div><h2>Vehicle registry</h2><p>{vehicles.length} vehicles registered across {new Set(vehicles.map((vehicle) => vehicle.region)).size} regions</p></div><button className="button button-primary" onClick={() => { if (role !== 'Fleet Manager') { flash(`${role} has read-only vehicle access.`); return; } setModal('vehicle'); }}><Plus size={16} /> Add vehicle</button></div><div className="registry-toolbar"><div className="registry-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search registration, model..." /></div><div className="filter-control"><select value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}><option>All types</option><option>Truck</option><option>Van</option><option>Trailer</option></select><ChevronDown size={13} /></div><div className="filter-control"><select value={vehicleStatus} onChange={(event) => setVehicleStatus(event.target.value)}><option>All statuses</option><option>Available</option><option>On Trip</option><option>In Shop</option><option>Retired</option></select><ChevronDown size={13} /></div><button className="sort-button" onClick={() => setSortAscending((value) => !value)}><ArrowDown size={14} /> Odometer</button></div><div onClick={(event) => { if ((event.target as HTMLElement).textContent === 'Odometer') setSortAscending((value) => !value); }}>{renderVehicles()}</div><div className="table-pagination"><span>Showing <strong>{visibleVehicles.length}</strong> of <strong>{vehicles.length}</strong> vehicles</span><div><button className="icon-button" disabled aria-label="Previous page"><ChevronLeft size={16} /></button><span className="page-number">1</span><button className="icon-button" disabled aria-label="Next page"><ChevronRight size={16} /></button></div></div></section>}

        {section === 'Drivers' && <><div className="driver-summary-grid"><div className="summary-tile"><span>Active drivers</span><strong>{drivers.filter((driver) => ['Available', 'On Trip'].includes(driver.status)).length}<small> / {drivers.length}</small></strong><span className="summary-note"><span className="live-mini-dot" /> 4 on duty right now</span></div><div className="summary-tile warning-tile"><span>License alerts</span><strong>{drivers.filter((driver) => { const days = (new Date(`${driver.expiry}T23:59:59`).getTime() - Date.now()) / 86400000; return days <= 30; }).length.toString().padStart(2, '0')}</strong><span className="summary-note">1 expiring soon · 1 expired</span></div><div className="summary-tile"><span>Average safety score</span><strong>{Math.round(drivers.reduce((sum, driver) => sum + driver.score, 0) / drivers.length)}<small> / 100</small></strong><span className="summary-note"><ShieldCheck size={13} /> +3 pts this month</span></div></div><section className="panel full-panel"><div className="panel-heading section-panel-heading"><div><h2>Driver roster</h2><p>License status and safety compliance for every driver</p></div><div className="panel-tools"><span className="role-view-tag"><ShieldCheck size={14} /> {role === 'Safety Officer' ? 'Safety view' : 'Compliance monitored'}</span><button className="icon-button" title="Driver filters" onClick={() => flash('Showing all driver statuses.')}><SlidersHorizontal size={17} /></button></div></div><div className="registry-toolbar"><div className="registry-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search drivers or license..." /></div><span className="compliance-count"><span className="green-status-dot" /> {drivers.filter((driver) => driver.status !== 'Suspended' && new Date(`${driver.expiry}T23:59:59`) >= new Date()).length} compliant</span></div>{renderDrivers()}</section></>}

        {section === 'Trips & Dispatch' && <><div className="dispatch-topline"><div className="trip-status-cards">{(['Draft', 'Dispatched', 'Completed', 'Cancelled'] as TripStatus[]).map((status) => <button className={`trip-status-card ${tripTab === status ? 'selected' : ''}`} key={status} onClick={() => setTripTab(status)}><span>{status}</span><strong>{statusCount(status).toString().padStart(2, '0')}</strong></button>)}</div><button className="button button-primary" onClick={() => { if (!['Fleet Manager', 'Dispatcher'].includes(role)) { flash(`${role} does not have dispatch permissions.`); return; } setModal('trip'); }}><Plus size={16} /> Create trip</button></div><section className="panel full-panel"><div className="panel-heading section-panel-heading"><div><h2>{tripTab} trips</h2><p>Dispatch updates are reflected across vehicles and drivers instantly</p></div><button className="icon-button" title="Refresh trips" onClick={() => flash('Trip board is up to date.')}><Activity size={17} /></button></div>{renderTrips()}</section><section className="dispatch-note"><Zap size={17} /><span><strong>Live dispatch sync</strong> Vehicle and driver availability updates automatically when trips are dispatched, completed, or cancelled.</span></section></>}

        {section === 'Maintenance' && <><div className="maintenance-summary"><div className="maintenance-stat"><span className="attention-icon danger-bg"><Wrench size={17} /></span><div><strong>{maintenance.filter((item) => item.status === 'In Progress').length.toString().padStart(2, '0')}</strong><span>In progress</span></div></div><div className="maintenance-stat"><span className="attention-icon green-bg"><CheckCircle2 size={17} /></span><div><strong>{maintenance.filter((item) => item.status === 'Resolved').length.toString().padStart(2, '0')}</strong><span>Resolved this month</span></div></div><div className="maintenance-stat"><span className="attention-icon amber-bg"><Clock3 size={17} /></span><div><strong>{currency(totalMaintenanceCost)}</strong><span>Total service costs</span></div></div><button className="button button-primary" onClick={() => { if (!['Fleet Manager', 'Safety Officer'].includes(role)) { flash(`${role} has read-only maintenance access.`); return; } setModal('maintenance'); }}><Plus size={16} /> Log maintenance</button></div><section className="panel full-panel"><div className="panel-heading section-panel-heading"><div><h2>Service history</h2><p>Maintenance tickets and vehicle service records</p></div><button className="period-select" onClick={() => flash('Showing service records for this month.')}>This month <ChevronDown size={13} /></button></div>{renderMaintenance()}</section></>}

        {section === 'Expenses & Fuel' && <><div className="expense-kpis"><KpiCard label="Fuel spend · October" value={currency(totalFuelCost)} note="Across all active vehicles" delta="-3.2%" positive icon={Fuel} accent="amber" /><KpiCard label="Maintenance spend" value={currency(totalMaintenanceCost)} note="4 service records" delta="+1.8%" icon={Wrench} accent="blue" /><KpiCard label="Fuel efficiency" value="5.8 km/L" note="Fleet weighted average" delta="+0.4 km/L" positive icon={Gauge} accent="green" /></div><section className="panel full-panel"><div className="panel-heading section-panel-heading"><div><h2>Fuel transactions</h2><p>Fueling records and per-vehicle consumption</p></div><button className="button button-secondary" onClick={() => flash('Fuel entry form is coming soon.')}><Plus size={15} /> Add fuel log</button></div>{renderFuel()}</section><section className="panel cost-breakdown-panel"><div className="panel-heading"><div><h2>Operational cost breakdown</h2><p>Current month · Fuel and maintenance by vehicle</p></div><button className="text-action" onClick={() => changeSection('Analytics & Reports')}>View reports <ArrowRight size={14} /></button></div><div className="cost-bars">{vehicles.slice(0, 5).map((vehicle, index) => { const fuel = fuelLogs.filter((item) => item.vehicleId === vehicle.id).reduce((sum, item) => sum + item.total, 0); const service = maintenance.filter((item) => item.vehicleId === vehicle.id).reduce((sum, item) => sum + item.cost, 0); return <div className="cost-bar-row" key={vehicle.id}><span>{vehicle.reg}</span><div className="cost-bar-track"><i style={{ width: `${Math.min(100, Math.max(8, ((fuel + service) / 1800) * 100))}%`, background: index % 2 ? '#d59153' : '#4a8e79' }} /></div><strong>{currency(fuel + service)}</strong></div>; })}</div></section></>}

        {section === 'Analytics & Reports' && <><div className="report-toolbar"><div><span className="report-period-label">REPORTING PERIOD</span><button className="period-select report-period" onClick={() => flash('Report period: October 1–16, 2026')}><CalendarDays size={15} /> Oct 1 – Oct 16, 2026 <ChevronDown size={13} /></button></div><div className="panel-tools"><button className="button button-secondary" onClick={() => window.print()}><FileBarChart2 size={15} /> Print report</button><button className="button button-primary" onClick={exportCsv}><Download size={15} /> Export CSV</button></div></div><div className="report-kpis"><KpiCard label="Revenue generated" value="$48,290" note="Across 63 completed deliveries" delta="+12.4%" positive icon={ArrowUpRight} accent="green" /><KpiCard label="Operating costs" value={currency(totalFuelCost + totalMaintenanceCost + 3630)} note="Fuel, service and tolls" delta="-2.1%" positive icon={ArrowDownLeft} accent="amber" /><KpiCard label="Fleet ROI" value="18.6%" note="Revenue less operating costs" delta="+2.8%" positive icon={Activity} accent="blue" /><KpiCard label="Cost per km" value="$1.84" note="Weighted fleet average" delta="-4.3%" positive icon={MapPin} accent="violet" /></div><div className="report-chart-grid"><section className="panel report-chart-panel"><div className="panel-heading"><div><h2>Operational costs</h2><p>Spend by category · last 7 days</p></div><button className="period-select" onClick={() => flash('Cost chart is showing the past 7 days.')}>Last 7 days <ChevronDown size={13} /></button></div><div className="cost-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={costData} margin={{ top: 12, right: 4, left: -14, bottom: 0 }} barGap={4}><CartesianGrid vertical={false} stroke="#e9eeeb" strokeDasharray="3 5" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#929b96', fontSize: 10 }} dy={6} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#929b96', fontSize: 10 }} tickFormatter={(value) => `$${value / 1000}k`} /><Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e9e6', fontSize: 12 }} formatter={(value) => currency(Number(value))} /><Bar dataKey="fuel" name="Fuel" fill="#4b8d79" radius={[3, 3, 0, 0]} /><Bar dataKey="maintenance" name="Maintenance" fill="#d1a05f" radius={[3, 3, 0, 0]} /><Bar dataKey="tolls" name="Tolls" fill="#8299ad" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="legend-dot fuel-legend" />Fuel</span><span><i className="legend-dot service-legend" />Maintenance</span><span><i className="legend-dot toll-legend" />Tolls</span></div></section><section className="panel report-chart-panel efficiency-panel"><div className="panel-heading"><div><h2>Fuel efficiency</h2><p>Average kilometers per liter</p></div><Fuel size={17} className="muted-icon" /></div><div className="efficiency-list">{vehicles.filter((vehicle) => vehicle.efficiency > 0).slice(0, 5).map((vehicle, index) => <div className="efficiency-row" key={vehicle.id}><span>{vehicle.reg}</span><div className="efficiency-bar"><i style={{ width: `${vehicle.efficiency * 10}%` }} /></div><strong>{vehicle.efficiency.toFixed(1)} <small>km/L</small></strong><span className={index < 2 ? 'efficiency-up' : 'efficiency-flat'}>{index < 2 ? <ArrowUpRight size={13} /> : <ArrowRight size={13} />}</span></div>)}</div><div className="efficiency-foot"><span>Fleet average</span><strong>5.8 km/L</strong></div></section></div><section className="roi-panel"><div className="roi-icon"><Activity size={20} /></div><div className="roi-copy"><span>VEHICLE ROI OVERVIEW</span><h2>Your fleet is generating strong returns.</h2><p>Based on delivery revenue minus fuel and maintenance costs, against acquisition value.</p></div><div className="roi-metric"><span>Fleet ROI</span><strong>18.6%</strong><small><ArrowUpRight size={13} /> 2.8% this month</small></div><div className="roi-divider" /><div className="roi-metric"><span>Revenue</span><strong>$48.3k</strong><small>63 completed trips</small></div><div className="roi-divider" /><div className="roi-metric"><span>Operating costs</span><strong>{currency(totalFuelCost + totalMaintenanceCost)}</strong><small>Fuel + maintenance</small></div></section></>}
      </main>
      <footer className="content-footer"><span>© 2026 TransitOps, Inc.</span><span>All systems operational <i className="live-mini-dot" /></span><button onClick={() => flash('Help center is coming soon.')}>Support <ArrowUpRight size={12} /></button></footer>
    </div>

    {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

    {modal && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}><section className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-heading"><div><span className="modal-kicker">{modal === 'trip' ? 'DISPATCH CONSOLE' : modal === 'vehicle' ? 'FLEET REGISTRY' : modal === 'maintenance' ? 'SERVICE WORKFLOW' : 'TRIP COMPLETION'}</span><h2 id="modal-title">{modal === 'trip' ? 'Create a new trip' : modal === 'vehicle' ? 'Add vehicle' : modal === 'maintenance' ? 'Log maintenance' : 'Complete trip'}</h2><p>{modal === 'trip' ? 'Assign an available vehicle and licensed driver.' : modal === 'vehicle' ? 'Add a new vehicle to your fleet.' : modal === 'maintenance' ? 'Create a service ticket and update vehicle status.' : 'Record final readings before closing out this delivery.'}</p></div><button className="icon-button" onClick={() => setModal(null)} aria-label="Close modal"><X size={18} /></button></div>
      {modal === 'trip' && <form className="modal-form" onSubmit={dispatchTrip}><div className="form-section-label"><span>01</span> ROUTE DETAILS</div><label className="form-field">Origin<input required value={tripForm.from} onChange={(event) => setTripForm({ ...tripForm, from: event.target.value })} placeholder="e.g. Oakland Port" /></label><label className="form-field">Destination<input required value={tripForm.to} onChange={(event) => setTripForm({ ...tripForm, to: event.target.value })} placeholder="e.g. Sacramento DC" /></label><label className="form-field">Planned distance <span className="input-suffix"><input type="number" min="1" value={tripForm.distance} onChange={(event) => setTripForm({ ...tripForm, distance: event.target.value })} placeholder="0" /><i>km</i></span></label><div className="form-section-label"><span>02</span> ASSIGNMENT</div><label className="form-field">Vehicle <div className="form-select-wrap"><select required value={tripForm.vehicleId} onChange={(event) => setTripForm({ ...tripForm, vehicleId: event.target.value })}><option value="">Select an available vehicle</option>{availableVehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.reg} · {vehicle.model} · {vehicle.maxLoad.toLocaleString()} kg</option>)}</select><ChevronDown size={15} /></div></label><label className="form-field">Driver <div className="form-select-wrap"><select required value={tripForm.driverId} onChange={(event) => setTripForm({ ...tripForm, driverId: event.target.value })}><option value="">Select a licensed driver</option>{availableDrivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name} · Class {driver.category}</option>)}</select><ChevronDown size={15} /></div></label><label className="form-field">Cargo weight <span className="input-suffix"><input required type="number" min="1" value={tripForm.weight} onChange={(event) => setTripForm({ ...tripForm, weight: event.target.value })} placeholder="0" /><i>kg</i></span></label>{overweight && <div className="form-alert error"><X size={15} /><span>Cargo exceeds {selectedTripVehicle?.reg} capacity by {(Number(tripForm.weight) - (selectedTripVehicle?.maxLoad ?? 0)).toLocaleString()} kg. Choose a larger vehicle or reduce the load.</span></div>}{expiredLicense && <div className="form-alert error"><ShieldCheck size={15} /><span>This driver&apos;s license is expired. Select a currently licensed driver.</span></div>}{selectedTripVehicle && !overweight && <div className="capacity-hint"><CheckCircle2 size={14} /> Capacity available: {(selectedTripVehicle.maxLoad - Number(tripForm.weight || 0)).toLocaleString()} kg</div>}<div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setModal(null)}>Cancel</button><button className="button button-primary" disabled={dispatchBlocked}><Zap size={15} /> Dispatch trip</button></div></form>}
      {modal === 'vehicle' && <form className="modal-form" onSubmit={addVehicle}><div className="form-two-col"><label className="form-field">Registration number<input required minLength={3} value={vehicleForm.reg} onChange={(event) => setVehicleForm({ ...vehicleForm, reg: event.target.value.toUpperCase() })} placeholder="e.g. TR-2049" /></label><label className="form-field">Vehicle type<div className="form-select-wrap"><select value={vehicleForm.type} onChange={(event) => setVehicleForm({ ...vehicleForm, type: event.target.value })}><option>Truck</option><option>Van</option><option>Trailer</option></select><ChevronDown size={15} /></div></label></div><label className="form-field">Make & model<input required value={vehicleForm.model} onChange={(event) => setVehicleForm({ ...vehicleForm, model: event.target.value })} placeholder="e.g. Volvo FH16" /></label><div className="form-two-col"><label className="form-field">Max load capacity<span className="input-suffix"><input required type="number" min="1" value={vehicleForm.maxLoad} onChange={(event) => setVehicleForm({ ...vehicleForm, maxLoad: event.target.value })} placeholder="0" /><i>kg</i></span></label><label className="form-field">Acquisition cost<span className="input-suffix"><i>$</i><input required type="number" min="1" value={vehicleForm.cost} onChange={(event) => setVehicleForm({ ...vehicleForm, cost: event.target.value })} placeholder="0" /></span></label></div><label className="form-field">Operating region<div className="form-select-wrap"><select value={vehicleForm.region} onChange={(event) => setVehicleForm({ ...vehicleForm, region: event.target.value })}><option>North</option><option>West</option><option>Central</option><option>East</option></select><ChevronDown size={15} /></div></label><div className="form-alert info"><CheckCircle2 size={15} /><span>New vehicles are added with Available status and 0 km on the odometer.</span></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setModal(null)}>Cancel</button><button className="button button-primary"><Plus size={15} /> Add vehicle</button></div></form>}
      {modal === 'maintenance' && <form className="modal-form" onSubmit={logMaintenance}><label className="form-field">Vehicle<div className="form-select-wrap"><select required value={maintenanceForm.vehicleId} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, vehicleId: event.target.value })}><option value="">Select a vehicle</option>{vehicles.filter((vehicle) => vehicle.status !== 'Retired').map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.reg} · {vehicle.model}{vehicle.status === 'On Trip' ? ' · On trip' : ''}</option>)}</select><ChevronDown size={15} /></div></label><label className="form-field">Issue or service type<input required value={maintenanceForm.title} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, title: event.target.value })} placeholder="e.g. Engine inspection" /></label><label className="form-field">Estimated cost<span className="input-suffix"><i>$</i><input type="number" min="0" value={maintenanceForm.cost} onChange={(event) => setMaintenanceForm({ ...maintenanceForm, cost: event.target.value })} placeholder="0" /></span></label><div className="form-alert info"><Wrench size={15} /><span>Logging active maintenance immediately marks this vehicle as In Shop.</span></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setModal(null)}>Cancel</button><button className="button button-primary"><Plus size={15} /> Create ticket</button></div></form>}
      {modal === 'complete' && <form className="modal-form" onSubmit={completeTrip}><div className="completion-trip"><span className="vehicle-mini-icon"><Truck size={17} /></span><div><strong>{completionForm.tripId}</strong><span>{trips.find((trip) => trip.id === completionForm.tripId)?.from} <ArrowRight size={12} /> {trips.find((trip) => trip.id === completionForm.tripId)?.to}</span></div><StatusBadge status="Dispatched" /></div><label className="form-field">Final odometer reading<span className="input-suffix"><input required type="number" min={vehicleFor(trips.find((trip) => trip.id === completionForm.tripId)?.vehicleId ?? 0)?.odometer ?? 0} value={completionForm.odometer} onChange={(event) => setCompletionForm({ ...completionForm, odometer: event.target.value })} /><i>km</i></span></label><label className="form-field">Fuel consumed<input type="number" min="0" step="0.1" value={completionForm.fuel} onChange={(event) => setCompletionForm({ ...completionForm, fuel: event.target.value })} placeholder="Optional" /></label><div className="form-alert info"><CheckCircle2 size={15} /><span>Vehicle and driver will return to Available when this trip is completed.</span></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setModal(null)}>Cancel</button><button className="button button-primary"><Check size={15} /> Complete trip</button></div></form>}
    </section></div>}

    {toast && <div className="toast-message" role="status"><CheckCircle2 size={17} /><span>{toast}</span><button onClick={() => setToast('')} aria-label="Dismiss notification"><X size={15} /></button></div>}
  </div>;
}

function KpiCard({ label, value, note, delta, positive = false, icon: Icon, accent }: { label: string; value: string; note: string; delta: string; positive?: boolean; icon: typeof Truck; accent: string }) {
  return <div className="kpi-card"><div className="kpi-top"><span>{label}</span><span className={`kpi-icon ${accent}`}><Icon size={17} /></span></div><div className="kpi-value">{value}</div><div className="kpi-bottom"><span>{note}</span><span className={`delta ${positive ? 'positive' : ''}`}>{positive ? <ArrowUpRight size={13} /> : <ArrowDown size={12} />}{delta}</span></div></div>;
}

function StatusBadge({ status }: { status: VehicleStatus | DriverStatus | TripStatus | Maintenance['status'] }) {
  const style: Record<string, string> = { Available: 'available', 'On Trip': 'on-trip', 'In Shop': 'in-shop', Retired: 'retired', Suspended: 'retired', 'Off Duty': 'off-duty', Draft: 'draft', Dispatched: 'on-trip', Completed: 'available', Cancelled: 'off-duty', 'In Progress': 'in-shop', Resolved: 'available' };
  return <span className={`status-badge ${style[status]}`}><i />{status}</span>;
}

function Avatar({ driver }: { driver: Driver }) {
  return <span className={`driver-avatar avatar-${driver.color}`}>{driver.initials}</span>;
}

function EmptyState({ icon: Icon, title, detail }: { icon: typeof Truck; title: string; detail: string }) {
  return <div className="empty-state"><span><Icon size={21} /></span><strong>{title}</strong><p>{detail}</p></div>;
}