# MVC_Example_Typescript

Este proyecto es una aplicación web para la gestión de datos relacionados con universidades, como estudiantes, cursos y profesores. Está construido utilizando Node.js y Express, con TypeScript como lenguaje principal. La estructura del proyecto sigue la arquitectura típica Modelo-Vista-Controlador (MVC), con directorios separados para controladores, modelos, rutas y vistas.

### Instalación:

1. **Instalar XAMPP**:
   - Descarga e instala [XAMPP](https://www.apachefriends.org/es/index.html) para configurar tu entorno local con Apache y MySQL.

2. **Instalar las dependencias**:
   - Ejecuta el siguiente comando para instalar las dependencias del proyecto:
     ```
     npm install
     ```

3. **Iniciar la aplicación**:
   - Para iniciar el servidor, ejecuta el siguiente comando:
     ```
     npm run start
     ```

Para entrar hay que ir al navegador y colocar http://localhost:6505/

### Componentes clave:

1. **Controladores**:
   - Ubicados en el directorio `build/controllers`, estos archivos contienen la lógica para manejar solicitudes HTTP e interactuar con la base de datos. Por ejemplo, `estudianteController.js` maneja operaciones relacionadas con los estudiantes, como consultas, inserciones, actualizaciones y eliminación de registros de estudiantes.

2. **Modelos**:
   - Se encuentran en el directorio `build/models`, estos archivos definen las estructuras de datos y los esquemas de la base de datos para la aplicación. Por ejemplo, `EstudianteModel.js` probablemente define el esquema para los registros de estudiantes.

3. **Rutas**:
   - El directorio `build/routes` contiene las definiciones de rutas que asignan solicitudes HTTP a funciones de los controladores. Por ejemplo, `estudianteRouter.js` define las rutas para listar, crear, modificar y eliminar estudiantes.

4. **Conexión a la base de datos**:
   - El archivo `build/db/conexion.js` maneja la configuración de la conexión a la base de datos. Utiliza TypeORM, un mapeador objeto-relacional (ORM) para TypeScript y JavaScript, para interactuar con una base de datos MySQL.

5. **Vistas**:
   - El directorio `views` (no detallado completamente en la estructura proporcionada) probablemente contiene plantillas Pug para renderizar páginas HTML.

6. **Configuración**:
   - El archivo `.env` almacena variables de entorno, como detalles de conexión a la base de datos y el puerto del servidor.
   - El archivo `package.json` enumera las dependencias del proyecto y scripts para compilar, iniciar y desarrollar la aplicación.

7. **Compilación y desarrollo**:
   - El directorio `src` contiene los archivos fuente en TypeScript, mientras que el directorio `build` contiene los archivos JavaScript transpilados.
   - El archivo `tsconfig.json` configura las opciones del compilador de TypeScript.
   - Los archivos `postcss.config.js` y `tailwind.config.js` configuran PostCSS y Tailwind CSS para los estilos.

### Funcionalidad:

- **Operaciones CRUD**:
  - La aplicación soporta operaciones Crear, Leer, Actualizar y Eliminar (CRUD) para varias entidades como estudiantes, cursos y profesores. Estas operaciones son gestionadas por los respectivos controladores y expuestas mediante rutas.

- **Interacción con la base de datos**:
  - La aplicación utiliza TypeORM para interactuar con una base de datos MySQL, lo que le permite realizar consultas complejas y transacciones.

- **Configuración del servidor**:
  - El archivo `build/index.js` inicializa el servidor, conecta a la base de datos y comienza a escuchar las solicitudes entrantes.

### Ejemplo de flujo de trabajo:

1. **Listar estudiantes**:
   - Una solicitud GET a `/listarEstudiantes` se enruta a la función `consultarTodos` en `estudianteController.js`, que consulta la base de datos y devuelve una lista de estudiantes.

2. **Crear un estudiante**:
   - Una solicitud GET a `/crearEstudiantes` renderiza un formulario para crear un nuevo estudiante.
   - Una solicitud POST a `/` con los datos del formulario se enruta a la función `insertar` en `estudianteController.js`, que valida e inserta el nuevo registro de estudiante en la base de datos.

3. **Modificar un estudiante**:
   - Una solicitud GET a `/modificarEstudiante/:id` obtiene los datos del estudiante y renderiza un formulario para editar.
   - Una solicitud POST a `/modificarEstudiante/:id` actualiza el registro del estudiante en la base de datos.

4. **Eliminar un estudiante**:
   - Una solicitud DELETE a `/eliminarEstudiante/:id` elimina el registro del estudiante de la base de datos.
