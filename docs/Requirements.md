# Functional Requirements

## 1. Core

### 1.1 Backend
### 1.2 Xplane Flight Loop

## 2. Frontend

## 3. Cloud*

## 4. Auto update

- [ ] The `Core` portion should check whether there is a newer version at start-up time. Warn use in xplane that a new version is available
- [ ] The `Core` portion should have well-defined OpenAPI and AsyncAPI.
- [ ] The `Frontend` portion should be published as zip file which would allow `core` to fetch and update frontend on
  the fly.
- [ ] The `Cloud` should have an API endpoint which provides the manifest of `core`, `backend` and `frontend` so the
  updater(core) can decide which components to update

### Use cases

1. Frontend only

   The manifest indicates only `frontend` update is required. In this case, `core` can simply download the and unzip the
   frontend
2. All components

   The manifest indicates `core` needs an update. in this case, we need to notify user that a full reinstall of plugin
   is required. and the core should not update anything

# Nonfunctional Requirements

## 1. CI/CD/Dev Setup

## 2. Code structure

We use [NX.DEV](https://nx.dev).

### Apps

- Core
- Frontend
- Frontend-e2e

### Libs

This is where we have buildable wasm and other UI components
