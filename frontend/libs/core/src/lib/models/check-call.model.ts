export interface CheckCall {
  id: string;
  loadId: string;
  driverId: string;
  driverName: string;
  checkInTime: Date;
  contactMethod: string;
  location?: string;
  currentLocation?: string;
  latitude?: number;
  longitude?: number;
  isTruckEmpty: boolean;
  trailerTemperature?: number;
  eta?: string;
  estimatedArrivalTime?: Date;
  delayMinutes?: number;
  delayReason?: string;
  milesToDestination?: number;
  fuelLevel?: number;
  equipmentIssue?: boolean;
  safetyIssue?: boolean;
  weatherDelay?: boolean;
  trafficDelay?: boolean;
  notes?: string;
  createdAt: Date;
}

export interface CreateCheckCallRequest {
  contactMethod: string;
  location?: string;
  currentLocation?: string;
  latitude?: number;
  longitude?: number;
  isTruckEmpty: boolean;
  trailerTemperature?: number;
  eta?: string;
  estimatedArrivalTime?: Date;
  delayMinutes?: number;
  delayReason?: string;
  milesToDestination?: number;
  fuelLevel?: number;
  equipmentIssue?: boolean;
  safetyIssue?: boolean;
  weatherDelay?: boolean;
  trafficDelay?: boolean;
  notes?: string;
}
