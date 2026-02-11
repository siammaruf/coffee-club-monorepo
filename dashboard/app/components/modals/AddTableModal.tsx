import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select } from "../ui/select";

interface AddTableModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
    number: string;
    seat: number;
    description: string;
    location: string;
    status: string;
  }) => void;
}

export default function AddTableModal({ open, onClose, onAdd }: AddTableModalProps) {
  const [number, setNumber] = useState("");
  const [seat, setSeat] = useState(1);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("available");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { number, seat, description, location, status };
      const formData = new FormData();
      formData.append("number", number);
      formData.append("seat", seat.toString());
      formData.append("description", description);
      formData.append("location", location);
      formData.append("status", status);
      onAdd(payload);
      setNumber("");
      setSeat(1);
      setDescription("");
      setLocation("");
      setStatus("available");
      onClose();
    } catch (error) {
      console.error("Failed to add table:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Add New Table</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Table Number</label>
            <Input
              value={number}
              onChange={e => setNumber(e.target.value)}
              placeholder="e.g. T1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Seats</label>
            <Input
              type="number"
              min={1}
              max={20}
              value={seat}
              onChange={e => setSeat(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Main Floor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select value={status} onChange={e => setStatus(e.target.value)} className="w-full">
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Table"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}