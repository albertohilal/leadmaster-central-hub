
Checklist ampliado

- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [ ] Clarify Project Requirements
- [ ] Scaffold the Project
- [ ] Customize the Project
- [ ] Install Required Extensions
- [ ] Compile the Project
- [ ] Create and Run Task
- [ ] Launch the Project
- [ ] Ensure Documentation is Complete

Clarify Project Requirements

- LeadMaster Central Hub con módulos: `auth`, `session-manager` (WhatsApp), `listener`, `sender` (campañas), frontend (Vite React).
- Multi-cliente: sesiones WhatsApp por `clienteId` gestionadas por `session-manager`. El `listener` solo consume APIs del `session-manager`.
- Sesión: inicia bajo demanda (botón cliente), permanece activa; opcional auto-reconexión por env.

Scaffold the Project

- Backend: Express modular (`src/modules/*`).
- Frontend: Vite React, vistas de campañas y programaciones.

Customize the Project

- JWT auth, scheduler de programaciones, perfiles Chrome aislados por cliente.

Install Required Extensions

- VS Code: ESLint, Prettier, REST Client.

Compile the Project

- Backend: `node src/index.js`.
- Frontend: `npm run dev`.

Create and Run Task

- VS Code tasks para backend y frontend.

Launch the Project

- Backend: `http://localhost:3010`.
- Frontend: `http://localhost:5173`.

Ensure Documentation is Complete

- `docs/ARQUITECTURA_MODULAR.md` actualizado.
- `docs/PRIORIDADES_FRONTEND.md` consolidado.
- [ ] Verify that the copilot-instructions.md file in the .github directory is created.

- [ ] Clarify Project Requirements

- [ ] Scaffold the Project

- [ ] Customize the Project

- [ ] Install Required Extensions

- [ ] Compile the Project

- [ ] Create and Run Task

- [ ] Launch the Project

- [ ] Ensure Documentation is Complete
