import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

export function MaintainerDashboard() {
  const maintainers = useQuery(api.maintainers.list);
  const unavailableMaintainers = useQuery(api.maintainers.getUnavailable);
  const [showAddForm, setShowAddForm] = useState(false);

  if (maintainers === undefined || unavailableMaintainers === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Maintainer Dashboard</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Add Maintainer
        </button>
      </div>

      {/* Currently Unavailable Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4 text-red-600">
          Currently Unavailable ({unavailableMaintainers.length})
        </h2>
        {unavailableMaintainers.length === 0 ? (
          <p className="text-gray-500">All maintainers are currently available</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unavailableMaintainers.map((maintainer) => (
              <UnavailableMaintainerCard key={maintainer._id} maintainer={maintainer} />
            ))}
          </div>
        )}
      </div>

      {/* All Maintainers Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">All Maintainers ({maintainers.length})</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {maintainers.map((maintainer) => (
            <MaintainerCard key={maintainer._id} maintainer={maintainer} />
          ))}
        </div>
      </div>

      {/* Add Maintainer Modal */}
      {showAddForm && (
        <AddMaintainerModal onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
}

function MaintainerCard({ maintainer }: { maintainer: any }) {
  const [showUnavailableForm, setShowUnavailableForm] = useState(false);
  const markAvailable = useMutation(api.maintainers.markAvailable);

  const handleMarkAvailable = async () => {
    try {
      await markAvailable({ maintainerId: maintainer._id });
      toast.success(`${maintainer.name} marked as available`);
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${maintainer.isAvailable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{maintainer.name}</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          maintainer.isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {maintainer.isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{maintainer.email}</p>
      <p className="text-sm text-gray-600 mb-3">{maintainer.department}</p>
      
      {!maintainer.isAvailable && maintainer.unavailableUntil && (
        <p className="text-sm text-red-600 mb-3">
          Until: {new Date(maintainer.unavailableUntil).toLocaleString()}
        </p>
      )}
      
      {maintainer.unavailableReason && (
        <p className="text-sm text-gray-600 mb-3 italic">"{maintainer.unavailableReason}"</p>
      )}

      <div className="flex gap-2">
        {maintainer.isAvailable ? (
          <button
            onClick={() => setShowUnavailableForm(true)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Mark Unavailable
          </button>
        ) : (
          <button
            onClick={handleMarkAvailable}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Mark Available
          </button>
        )}
      </div>

      {showUnavailableForm && (
        <UnavailableForm
          maintainerId={maintainer._id}
          maintainerName={maintainer.name}
          onClose={() => setShowUnavailableForm(false)}
        />
      )}
    </div>
  );
}

function UnavailableMaintainerCard({ maintainer }: { maintainer: any }) {
  const markAvailable = useMutation(api.maintainers.markAvailable);

  const handleMarkAvailable = async () => {
    try {
      await markAvailable({ maintainerId: maintainer._id });
      toast.success(`${maintainer.name} marked as available`);
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const timeRemaining = maintainer.unavailableUntil ? maintainer.unavailableUntil - Date.now() : 0;
  const hoursRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60)));

  return (
    <div className="p-4 rounded-lg border bg-red-50 border-red-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{maintainer.name}</h3>
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          {hoursRemaining}h remaining
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-1">{maintainer.department}</p>
      {maintainer.unavailableUntil && (
        <p className="text-sm text-red-600 mb-2">
          Until: {new Date(maintainer.unavailableUntil).toLocaleString()}
        </p>
      )}
      {maintainer.unavailableReason && (
        <p className="text-sm text-gray-600 mb-3 italic">"{maintainer.unavailableReason}"</p>
      )}
      <button
        onClick={handleMarkAvailable}
        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Mark Available Now
      </button>
    </div>
  );
}

function UnavailableForm({ maintainerId, maintainerName, onClose }: {
  maintainerId: Id<"maintainers">;
  maintainerName: string;
  onClose: () => void;
}) {
  // Set default to tomorrow at 9 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  
  const [unavailableUntil, setUnavailableUntil] = useState(
    tomorrow.toISOString().slice(0, 16) // Format for datetime-local input
  );
  const [reason, setReason] = useState("");
  const markUnavailable = useMutation(api.maintainers.markUnavailable);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedDate = new Date(unavailableUntil);
      const now = new Date();
      
      if (selectedDate <= now) {
        toast.error("Please select a future date and time");
        return;
      }

      await markUnavailable({
        maintainerId,
        unavailableUntil: selectedDate.getTime(),
        reason: reason.trim() || undefined,
      });
      
      toast.success(`${maintainerName} marked as unavailable until ${selectedDate.toLocaleString()}`);
      onClose();
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Mark {maintainerName} as Unavailable</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Unavailable until:</label>
            <input
              type="datetime-local"
              value={unavailableUntil}
              onChange={(e) => setUnavailableUntil(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <span className="text-xs text-gray-500 mt-1 block">
              Select when the maintainer will be available again
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason (optional):</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., On vacation, Sick leave, Training..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Mark Unavailable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMaintainerModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const createMaintainer = useMutation(api.maintainers.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !department.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createMaintainer({
        name: name.trim(),
        email: email.trim(),
        department: department.trim(),
      });
      toast.success("Maintainer added successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to add maintainer");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add New Maintainer</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department:</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
            >
              Add Maintainer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
