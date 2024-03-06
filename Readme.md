# Plataforma de Organización Señalización Digital

Este sistema está diseñado para funcionar en un `servidor local con Windows`,  para poder ejecutarlo, se deben seguir los siguientes pasos.

El proyecto consta de un monorepo, que consta de 4 elementos:

```
digital-signage-controller
|
|- Interface/
|- Server/
|- run-services.bat
└- .gitignore
```

En `Interface` contamos con la UI de la plataforma, la cual está hecha con `TypeScript`, `React` y el empaquetador `Vite`. Para ejecutarlo se requiere instalar de forma global Yarn en el servidor local.

En `Server`, es donde tenemos nuestro servidor montado con `Node.js` y `Express`, el cual levanta nuestro back-end en el puerto `7000`. Aquí es donde tenemos la gestión de los archivos, y el login.


## Configuración inicial de Interface

La UI cuenta con 2 archivos de peticiones fetch a nuestro back-end, estas peticiones se hacen con Axios, en ellas habría que remplazar en las URL la palabra `localhost` por la `IP` donde levante nuestro servidor.

Estos dos archivos se encuentran en:
```
digital-signage-controller
|
└- Interface/
   └-src
     └-helpers
       |-getFiles.tsx
       └-uploadForm.tsx
```

`getFiles.tsx`
```tsx
import axios from "axios"

export const getFiles = async (category: string, company:string) =>{

    //Cambiamos localhost por la ip del servidor
    const res = await axios.get(`http://localhost:7000/api/search-${category}?company=${company}`)
    const data  = await res.data
    
    console.log(data)
  
  
  return data
}

```
`uploadFiles.tsx`
```tsx
import axios from "axios";

...

export const uploadForm = async ( file: File | null, category: Categories) => {
  ...
  try {
    //Cambiamos localhost por la ip del servidor
    const res = await axios.post(`http://localhost:7000/api/save-${categories}?company=${company}`, formData, {
      ...
    });
    ...
  } catch (error) {
    ...
  }

};


```

Para la gestión de usuarios, contamos con un archivo JSON donde tenemos los usuarios que pueden acceder al portal dependiendo su correo. Esto seguirá así en la versión 1.0.0, en la versión 2 se usará correctamente una BD en MySQL.

Este archivo se encuentra en:
```
digital-signage-controller
|
└- Interface/
   └-src
     └-mock
       └-users.json
```

La estructura del JSON se compone de un objeto `users` con un array de objetos de la siguiente forma.

```JSON
{
  "users": [
    {
      "email" : "disenoanimacion@grupo-iamsa.com.mx",
      "area" : "designers",
      "image" : "/img/users/designers.png",
      "name" : "Gerardo Laderos"
    },
    {
      "email" : "diseno2@grupo-iamsa.com.mx",
      "area" : "designers",
      "image" : "/img/users/designers.png",
      "name" : "Sara"
    },
  ]
}
```

Aquí podemos modificar la foto del avatar que aparecerá según su área, el nombre del dueño del correo, y el propio correo. El `area`, además de determinar el avatar, define la ruta a la que tendrá acceso el usuario y así mismo los que tiene permitido ver y manipular.

Contamos con 3 rutas:
- Admin - tiene control total, puede subir, actualizar y eliminar
- Manager - no puede manipular nada, sin embargo, puede visualizar todo.
- Designers - solo pueden visualizar las campañas, los planos y los blueprints

#


Para iniciar lo de forma independiente, se ejecuta lo siguiente:

**Instalamos las dependencias**
```sh
yarn install
```

**Arrancamos la UI**
```sh
yarn dev --host
```
Esto expondrá los puertos para poder acceder en cualquier máquina a través de la red local, ejemplo, `http://172.15.176.126:5173/`

La IP la define el servidor local y el puerto está definido por Vite,
en desarrollo sería, `http://localhost:5173/`

# Configuración inicial del Server

Los directorios donde se guardarán los archivos mostrados y subidos, se deben de crear manualmente, ya que estos directorios son omitidos en el `.gitignore` de la raíz, y que son privados.

Se deben añadir una carpeta `files` con los siguientes directorios dentro de `src`:
```
digital-signage-controller
|
└- Server/
   └- src
     └- files
        |-- Costaline
        |   |-blueprints
        |   |-price
        |   └-templates
        |
        |-- ETN
        |   |-blueprints
        |   |-price
        |   └-templates
        |
        |-- GHO
        |   |-blueprints
        |   |-price
        |   └-templates
        |
        |-- IAMSA
        |   |-blueprints
        |   |-price
        |   └-templates
        |
        └-- software
```

**Es muy importante que estos directorios estén escritos exactamente como en el diagrama, ya que son las rutas que usará la dependencia multer para manejar los archivos.**

Nuestro back-end devuelve la ruta donde se almacenaron los archivos para que el usuario pueda descargarlos una vez cargados, si es necesario. Como tenemos la carpeta `files` configurada como ruta de archivos estáticos, debemos modificar el path que devuelve y cambiar de igual manera la palabra `localhost` por la `IP` del servidor.

Para esto nos dirigiremos a la siguiente ruta:
```
digital-signage-controller
|
└- Server/
   └- src
     └- routes
        └- getFiles.js
```

En el archivo `getFiles.js` es donde tenemos el manejo de la petición de los archivos, en el cual hay una ruta para cada carpeta. Ejemplo:
```javascript
  //search-templates cambia dependeindo el nombre del directorio al que se hace la peticion

  getFiles.get("/search-templates", (req, res) =>{
    ...
  })
```
Dentro tenemos una constante `downloadPath` que es la que devuelve la ruta de descarga, en ella es donde debemos cambiar `localhost` por la `IP` de nuestro servidor.

```javascript
  //cambia localhost por la IP de tu servidor
  getFiles.get("/search-templates", (req, res) =>{
    ...
      const downloadPath = `http://localhost:7000/${company}/templates/${file}`
    ...
  })
```

#
Para iniciar el servidor, aremos lo siguiente:

**Instalamos las dependencias**
```sh
npm install
```

**Arrancamos el servidor**
```sh
npm run dev
```


# Despliegue en conjunto al arrancar el equipo "Windows"

Una vez configurado nuestro UI y Server, lo ideal es que arranque junto con el equipo, así que por ello tenemos en la raíz un archivo run-services.bat el cual nos ayuda con esta función.

Lo único que tenemos que modificar es la ruta donde guardaremos el monorepo.
En este caso, por defecto, se contempla que el directorio donde está guardado el Interface y el Server está en `C:/dev/digital-signage/`

```sh
@echo off


cd C:/dev/digital-signage/Interface
start cmd /k "yarn dev --host"


cd C:/dev/digital-signage/Server
start cmd /k "npm run dev"
```

Una vez echo esto, solo debemos crear un acceso directo al archivo `run-services.bat` y mover el acceso directo a la carpeta de programas de arranque de Windows ubicada en `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp
`
Una vez hecho esto, la plataforma iniciará automáticamente al encender el equipo, aunque no inicies sesión en el servidor local.

#
**Para cualquier duda o comentario, puedes contactar directamente a [JasubiPL](https://github.com/JasubiPL)* 🧑‍💻