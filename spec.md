SPEC PROMPT: Build a Market-Leading Trucking TMS (Transportation Management System)
Overview

Build a fully featured, modern, modular Transportation Management System (TMS) for the trucking industry. The system should support multiple equipment types with the first implemented module being Power Only. Architecture must be enterprise-class, easily extensible, API-driven, secure, and adhere to industry best practices.

The system must rival market-leading TMS platforms in features, usability, performance, and integration capabilities.

Architecture Requirements
Frontend

Framework: Angular (latest stable).

UI Library: Material UI design system (Angular Material), styled to match the brand guidelines from:
https://brand.truckstop.com

Responsive: Fully mobile responsive with breakpoints for phone, tablet, desktop.

Structure: Use an intuitive, modular monorepo structure (e.g., Nx).

Key UI Elements:

Dashboard with KPIs

Equipment-type selector (starting with Power Only, but extensible)

Global messaging/notification system

Reusable form components with validation states

Data tables with filtering, sorting, pagination

Modals, drawers, side-panels for CRUD operations

Theme service to manage Truckstop-brand color palette

Backend

Framework: .NET 8 (C#)

Architecture: Clean Architecture / Onion Architecture

Domain

Application

Infrastructure

API

API Layer: FastAPI-style developer experience (simple, intuitive, well-documented), but implemented in .NET with minimal APIs or controllers using best-practice patterns.

API Requirements:

RESTful endpoints

OpenAPI/Swagger auto-generation

Versioned endpoints

Built-in authentication/authorization (JWT or OAuth)

Dependency injection first-class

Proper async/await usage across layers

Integrations:

Well-marked MCP (Motor Carrier Platform) integration points

Webhook system for real-time updates

Event-driven extension support (via internal event bus)

Easy plugin-style connectors for:

Load boards

ELDs/Telematics providers

SaferWatch / RMIS / carrier onboarding tools

Accounting systems

Database: PostgreSQL or SQL Server (configurable)

ORM: EF Core

Caching: Redis

Feature Requirements (Match Any Market-Leading TMS)
1. Dispatch & Load Management

Create / edit / cancel loads

Power Only load type support (first module)

Trailer/equipment attachment

Driver assignment / re-assignment

Trip planning

Scheduling and calendar views

Email/SMS dispatching

Document upload & management

Real-time tracking (API stub + interface)

2. Load Board & MCP Integrations

Plug-in architecture to connect to:

Truckstop

DAT

NextLoad

Private loadboards

Ability to retrieve:

Available loads

Pricing & market data

Post trucks

Search loads

Integration endpoints should be wrapped in services that can easily be mocked.

3. Carrier & Driver Management

Driver profiles

Carrier profiles

Equipment assignment

Compliance (CDL expiry, insurance expiry alerts)

Onboarding workflows

Document vault

4. Equipment Management

Modular equipment system

First implementation: Power Only

Subsequent modules should be simple to add (e.g., Dry Van, Reefer, Flatbed)

Equipment telemetry hooks

5. Accounting & Settlement

Rate confirmation generator

Driver settlement statements

Fuel surcharge support

Accessorial management

Invoice creation and export

API endpoints for QuickBooks / accounting integrations

6. Mapping & Routing

Route planning (stub integrations for PC*Miler, Google Maps)

Check call workflow

Live tracking dashboard

7. Customer & Shipper Management

Customer profiles

Lane management

Contract rate setup

Address book

Contacts

8. Document & Reporting System

Document uploads (PDF/JPG/PNG)

Document tagging

Standard reports:

Revenue

Driver utilization

Equipment utilization

On-time performance

Report export: CSV, PDF

API Requirements
General Principles

Modeled after the ease-of-use of FastAPI.

Use .NET minimal API or clean controllers.

Every endpoint MUST:

Have OpenAPI/Swagger documentation

Provide examples

Be strongly typed

Include error models

Response envelope should follow a consistent pattern:

{
  "success": true,
  "data": {},
  "errors": []
}

Integration Points

Every module exposes integration hooks:

Webhooks (/webhooks/...)

Loadboard connectors (/integrations/loadboards/...)

MCP connectors (/integrations/mcp/...)

Carrier/driver onboarding (/integrations/onboarding/...)

File Structure (Proposed)
Root
/tms
  /frontend
    /apps
      /web
      /mobile
    /libs
      /ui
      /core
      /features
        /dispatch
        /drivers
        /equipment
        /accounting
        /integrations
  /backend
    /src
      /Domain
      /Application
      /Infrastructure
      /API
    /tests
      /Domain.Tests
      /Application.Tests
      /API.Tests
  /docs
    api
    ui
    architecture
  /deploy

Module: Power Only (Initial Implementation)
Capabilities

Create a Power Only load

Set pickup/delivery locations

Attach tractor to third-party trailer

Track status (Booked → Dispatched → Picked Up → Delivered → Completed)

Power Only-specific pricing and surcharge logic

Power Only-specific compliance checks

API endpoints:

/equipment/power-only

/loads/power-only

/dispatch/power-only

UI Pages

Power Only dashboard

Create Load form

Assign Driver modal

Trip timeline view

Documents panel

Development Requirements

Strong type safety across the stack

Strict linting + Prettier

Reusable interfaces for all domain models

Automated tests where possible

CI/CD pipeline-ready structure

The entire system must be designed for extensibility, so adding new equipment types or connectors involves minimal boilerplate.

Goal

Generate code, stubs, file structure, modules, and documentation so the system can evolve into a full enterprise-grade TMS with minimal friction.