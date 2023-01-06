# Functional Requirements

## 1. Core

## 2. Backend

## 3. Frontend

## 4. Cloud*

# Nonfunctional Requirements

## 1. CI/CD

## 2. Auto update

- [ ] The `Core` portion should check whether there is a newer version at start-up time.
- [ ] The `Core` portion should have minimum business logic and most backend business logic should be delivered
  as `wasm` module. In that way, we can upload wasm module on the fly instead of the entire application
- [ ] The `Core` portion should have well-defined OpenAPI and AsyncAPI.
- [ ] The `Backend` business logic should be done by `wasm` so we can update/patch backend without reinstall the whole
  plugin
- [ ] The `Frontend` portion should be published as zip file which would allow `core` to fetch and update frontend on
  the fly.
- [ ] The `Cloud` should have an API endpoint which provides the manifest of `core`, `backend` and `frontend` so the
  updater(core) can decide which components to update

### Use cases

1. Frontend only

   The manifest indicates only `frontend` update is required. In this case, `core` can simply download the and unzip the
   frontend
2. Frontend and backend

   The manifest indicates both `frontend` and `backend` update are required. In this case, `core` can will download the
   and unzip the
   frontend and backend
3. All components

   The manifest indicates `core` needs an update. in this case, we need to notify user that a full reinstall of plugin
   is required. and the core should not update anything

## 3. Code structure


