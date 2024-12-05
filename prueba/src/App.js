import React, { useEffect, useState } from "react";  // Importa React y los hooks `useEffect` y `useState` para el manejo de efectos y estados.
import axios from "axios";  // Importa axios para realizar solicitudes HTTP.
import "bootstrap/dist/css/bootstrap.min.css";  // Importa los estilos de Bootstrap.
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 

const App = () => { 
  const [data, setData] = useState([]);  // Estado para almacenar los datos recibidos del servidor.
  const [currentPage, setCurrentPage] = useState(1);  // Estado para llevar el seguimiento de la página actual.
  const itemsPerPage = 10;  // Número de elementos por página en la paginación.
  const [searchTerm, setSearchTerm] = useState("");  // Estado para almacenar el término de búsqueda.

  useEffect(() => {  // `useEffect` se ejecuta cuando el componente se monta.
    axios  // Realiza una solicitud GET a la API para obtener los datos.
      .get("http://localhost:5000/data")  // URL del servidor local.
      .then((response) => setData(response.data.children || []))  // Si la solicitud es exitosa, almacena los datos en el estado `data`.
      .catch((error) => console.error("Error fetching data:", error));  // Si ocurre un error, lo muestra en la consola.
  }, []);  // El array vacío como segundo argumento para que se ejecute solo una vez se monte la info

  const handleSearch = (event) => {  // Función para manejar el cambio en el input de búsqueda.
    setSearchTerm(event.target.value);  // Actualiza el estado `searchTerm` con el ingresado en el campo de búsqueda.
  };

  const filterData = () => {  // Función para filtrar los datos en segun lo que se busca.
    if (!searchTerm) return data;  // Si no hay término de búsqueda, devuelve los datos sin cambios.
    return data.filter((item) =>  // Filtra los datos según si el término de búsqueda está incluido en la representación en cadena del objeto.
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())  // Convierte cada objeto en una cadena y verifica si contiene el término de búsqueda.
    );
  };

  // Función para resaltar el término de búsqueda dentro de un texto
  const highlightText = (text) => {
    if (!text) return text;  // Si el texto es nulo o indefinido, lo retorna tal cual.
    const regex = new RegExp(`(${searchTerm})`, "gi");  // Crea una expresión regular para encontrar todas las coincidencias del término de búsqueda, ignorando mayúsculas/minúsculas.
    return text.split(regex).map((part, index) =>  // Divide el texto en partes usando el término de búsqueda como delimitador.
      part.toLowerCase() === searchTerm.toLowerCase() ? (  // Si la parte coincide con el término de búsqueda.
        <span key={index} style={{ backgroundColor: 'yellow', fontWeight: 'bold' }}>{part}</span>  // Resalta la parte con un fondo amarillo y texto en negrita.
      ) : (
        part  // Si no es una coincidencia, simplemente retorna la parte sin cambios.
      )
    );
  };

  const renderDocumentMetadata = (metadata, key) => {  /* Función para renderizar los metadatos del documento. */
    return (
      <div className="mb-4" key={key}>  {/* Crea un contenedor `div` para los metadatos, utilizando un `key` único. */}
        <h5 className="text-primary">Metadata del Documento</h5>  {/* Título para los metadatos. */}
        <div>
          {/* Aquí se verifica si existe cada uno de los metadatos y, si es así, se muestra */}
          {metadata.year && <p><strong>Año:</strong> {highlightText(metadata.year)}</p>}  {/* Si existe el año, se muestra con el término en negrita si corresponde. */}
          {metadata.expeditionDate && <p><strong>Fecha de Expedición:</strong> {highlightText(metadata.expeditionDate)}</p>}  
          {metadata.publishDate && <p><strong>Fecha de Publicación:</strong> {highlightText(metadata.publishDate)}</p>} 
          {metadata.name && <p><strong>Nombre:</strong> {highlightText(metadata.name)}</p>}  
          {metadata.description && <p><strong>Descripción:</strong> {highlightText(metadata.description)}</p>}  
        </div>
      </div>
    );
  };
  

  const renderBlockContent = (block, key) => {  /* Función para renderizar el contenido de un bloque. */
    return (
      <div className="mb-4" key={key}>  {/* Crea un contenedor `div` para el bloque, utilizando un `key` único. */}
        <div>
          {/* Si existe un GUID, lo muestra con el término resaltado. */}
          {block.GUID && <p><strong>GUID:</strong> {highlightText(block.GUID)}</p>}
          {/* Lo mismo para la fecha válida. */}
          {block.validDate && <p><strong>Fecha Válida:</strong> {highlightText(block.validDate)}</p>}
          {/* Si el bloque tiene hijos, los muestra. */}
          {block.children && block.children.length > 0 && (
            <div className="mt-3">
              {/* Mapea sobre los hijos y los renderiza. */}
              {block.children.map((child, idx) => {
                const childKey = child.text + idx;  /* Usa el texto del hijo y el índice como clave única. */
                return (
                  <p key={childKey} className="mb-2">  {/* Cada hijo tiene su propio `key` único. */}
                    {highlightText(child.text)}  {/* Resalta el texto del hijo si es necesario. */}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderPage = (data) => {  // Función para renderizar la página actual de datos.
    return data.map((node, index) => {  // Mapea sobre los datos filtrados.
      const key = node.tag + index;  // Crea una clave única para cada nodo, combinando el `tag` y el índice.

      if (node.tag === "documentMetadata") {  // Si el nodo es de tipo `documentMetadata`, lo renderiza.
        return renderDocumentMetadata(node.attributes, key);
      } else if (node.tag === "block") {  // Si el nodo es de tipo `block`, lo renderiza.
        return renderBlockContent(node, key);
      } else {
        return null;  // Si no es ni un `documentMetadata` ni un `block`, no renderiza nada.
      }
    });
  };

  const handlePageChange = (newPage) => {  // Función para cambiar la página actual.
    setCurrentPage(newPage);  // Actualiza el estado `currentPage` con la nueva página.
  };

  const startIndex = (currentPage - 1) * itemsPerPage;  // Calcula el índice de inicio para la página actual.
  const currentData = filterData().slice(startIndex, startIndex + itemsPerPage);  // Obtiene los datos para la página actual, según el número de elementos por página.

  return (
    <div className="container-fluid px-3 mt-4" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="card shadow-lg border-0" style={{ flex: '1 0 auto' }}>
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h1 className="h4 mb-0 text-center" style={{ fontSize: '18px' }}>Avance Jurídico SAS - Prueba Técnica </h1> 
          <input
            type="text"
            placeholder="Buscar..."
            className="form-control"
            style={{ width: '300px' }}
            value={searchTerm}  // El valor del input es el estado `searchTerm`.
            onChange={handleSearch}  // Llama a `handleSearch` cuando cambia el texto del input.
          />
        </div>
        <div className="card-body" style={{ fontSize: '14px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)', padding: '20px' }}>
          {data.length > 0 ? (  // Si hay datos, renderiza la página actual.
            renderPage(currentData)
          ) : (  // Si no hay datos, muestra un spinner de carga.
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          )}
        </div>
        <div className="card-footer d-flex justify-content-between" style={{ backgroundColor: '#f8f9fa', padding: '10px 20px' }}>
          <button
            className="btn btn-outline-primary"
            disabled={currentPage === 1}  // Deshabilita el botón si ya estamos en la primera página.
            onClick={() => handlePageChange(currentPage - 1)}  // Cambia a la página anterior.
          >
            Anterior
          </button>
          <span className="text-muted" style={{ fontSize: '14px' }}>
            Página {currentPage} de {Math.ceil(filterData().length / itemsPerPage)}   {/* Muestra el número de página actual y el total de páginas. */}
          </span>
          <button
            className="btn btn-outline-primary"
            disabled={currentPage === Math.ceil(filterData().length / itemsPerPage)}  // Deshabilita el botón si ya estamos en la última página.
            onClick={() => handlePageChange(currentPage + 1)}  // Cambia a la página siguiente.
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default App; 
