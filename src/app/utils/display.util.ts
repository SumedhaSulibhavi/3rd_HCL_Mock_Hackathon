export function categoryLabel(value: string): string {
  const map: Record<string, string> = {
    SoftwareIssue: 'Software Issue',
    'Software Issue': 'Software Issue',
    HardwareComplaint: 'Hardware Complaint',
    'Hardware Complaint': 'Hardware Complaint',
    NetworkIncident: 'Network Incident',
    'Network Incident': 'Network Incident',
    AccessRequest: 'Access Request',
    'Access Request': 'Access Request',
    Other: 'Other',
  };
  return map[value] ?? value.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function isSlaBreached(
  slaDueDate: string,
  status: string,
): boolean {
  if (status === 'Resolved' || status === 'Closed') return false;
  return new Date(slaDueDate).getTime() < Date.now();
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}
