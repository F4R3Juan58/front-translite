# TransLite – MVP

Aplicación web para la **gestión de rutas y entregas** en empresas de transporte.  
Permite organizar rutas de carga/descarga, asignar conductores y vehículos, y gestionar empleados desde una interfaz sencilla y moderna.

🔗 **Demo en producción**: [TransLite – Vercel](https://front-translite-bhny.vercel.app/)

---

## 📌 Características principales

- 📅 **Calendario de rutas**: consulta diaria de las rutas programadas.  
- ➕ **Creación de rutas**: define empresa, puntos de carga/descarga, bultos, fechas y asigna transportes.  
- 🚚 **Gestión de vehículos**: registro de marca, modelo y matrícula.  
- 👨‍💼 **Gestión de empleados**: alta de administradores y conductores, con datos de contacto y permisos.  
- 🔒 **Autenticación**: inicio/cierre de sesión para el panel de administración.  
- ⚡ **Interfaz responsive** desarrollada con **React + TypeScript + Vite** y estilizada con **Tailwind CSS**.  

---

## 🖼️ Capturas de pantalla

### Calendario de rutas
<img width="1914" height="905" alt="calendar" src="https://github.com/user-attachments/assets/74b3de79-bf3c-41d6-89a6-1f8cc07ed5d4" />

### Crear nueva ruta
<img width="1916" height="908" alt="create-route" src="https://github.com/user-attachments/assets/af9a936d-0da2-4576-8f88-2c8d99d2d466" />

### Gestión de vehículos
<img width="1916" height="910" alt="vehicles" src="https://github.com/user-attachments/assets/15289c9b-c83a-467d-9fbe-bd9683c0e6e0" />

### Gestión de empleados
<img width="1919" height="903" alt="employees" src="https://github.com/user-attachments/assets/778f4c70-20cb-41c4-a52c-22ff3fe1e8c4" />



---

## 🛠️ Tecnologías utilizadas

- **React** (con hooks y componentes funcionales)  
- **TypeScript**  
- **Vite** como bundler y servidor de desarrollo  
- **Tailwind CSS** para estilos  
- **ESLint** + **TypeScript config** para buenas prácticas  

---

## 🚀 Instalación y uso

```bash
# Clonar repositorio
git clone https://github.com/F4R3Juan58/front-translite.git

# Entrar al directorio
cd front-translite

# Instalar dependencias
npm install

# Iniciar servidor en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview
```

---

## ⚙️ Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Ejemplo
VITE_API_URL=http://localhost:4000
```

> ⚠️ Ajusta según la URL real de tu backend/API.

---

## 📂 Estructura del proyecto

```
front-translite/
├── public/               # Archivos estáticos
├── src/
│   ├── assets/           # Imágenes, logos
│   ├── components/       # Componentes reutilizables
│   ├── pages/            # Páginas principales (Rutas, Vehículos, Empleados)
│   ├── hooks/            # Hooks personalizados
│   ├── services/         # Conexión a APIs
│   ├── utils/            # Funciones auxiliares
│   ├── App.tsx           # Punto de entrada de la app
│   └── main.tsx          # Renderizado raíz
├── .env                  # Variables de entorno
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas.  
Pasos recomendados:

1. Haz un **fork** del proyecto.  
2. Crea una rama para tu feature/fix: `git checkout -b mi-feature`.  
3. Realiza commits descriptivos.  
4. Abre un Pull Request explicando los cambios.  

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.  
Consulta el archivo [LICENSE](./LICENSE) para más información.

---

## 👤 Autor

**F4R3Juan58**  
🔗 GitHub: [@F4R3Juan58](https://github.com/F4R3Juan58)  
