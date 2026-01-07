export interface LoadStatusHistory {
  id: string;
  loadId: string;
  previousStatus?: string;
  newStatus: string;
  changedAt: Date;
  changedByUserId?: string;
  changedByUserName?: string;
  changedBy?: string;
  reason?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  isAutomatic: boolean;
  isAutomaticTransition?: boolean;
}

export interface ChangeLoadStatusRequest {
  newStatus: string;
  reason?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  isAutomatic: boolean;
}

export interface LoadStatusTransitions {
  loadId: string;
  currentStatus: string;
  validNextStatuses: string[];
}

export enum LoadStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Booked = 'Booked',
  AwaitingAssignment = 'AwaitingAssignment',
  Assigned = 'Assigned',
  Dispatched = 'Dispatched',
  DriverEnRoute = 'DriverEnRoute',
  AtPickup = 'AtPickup',
  Loading = 'Loading',
  PickedUp = 'PickedUp',
  InTransit = 'InTransit',
  AtStop = 'AtStop',
  Delayed = 'Delayed',
  AtDelivery = 'AtDelivery',
  Unloading = 'Unloading',
  Delivered = 'Delivered',
  PendingPOD = 'PendingPOD',
  PODReceived = 'PODReceived',
  Invoiced = 'Invoiced',
  Completed = 'Completed',
  OnHold = 'OnHold',
  Cancelled = 'Cancelled',
  Problem = 'Problem'
}
