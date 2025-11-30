import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockTicketHistory = [
  { id: "T001", subject: "Login Issue", priority: "Low", status: "Resolved", date: "2024-11-01" },
  { id: "T002", subject: "Account Access", priority: "High", status: "Open", date: "2024-11-05" },
];

export default function SupportModal({ open, onOpenChange }: SupportModalProps) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketNumber = `#${String(mockTicketHistory.length + 1).padStart(4, "0")}`;
    toast({
      title: "Ticket Created",
      description: `Support ticket ${ticketNumber} has been created successfully.`,
    });
    setSubject("");
    setDescription("");
    setPriority("medium");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={currentUser.name || "John Smith"} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={currentUser.email || "john.smith@example.com"} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about your issue"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Attachment (Optional)</Label>
            <Input type="file" />
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-3">Previous Tickets</h3>
            <div className="space-y-2">
              {mockTicketHistory.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.id} • {ticket.date}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      ticket.status === "Resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Submit Ticket
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
