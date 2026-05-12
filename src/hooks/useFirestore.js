import { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Hook para interactuar con Firestore
 * Estructura de colecciones:
 * - meses/{mesId} -> estado del mes
 * - recibos/{mesId} -> montos de agua, luz, limpieza
 * - habitantes/{mesId}/departamentos/{numero} -> número de personas por depto
 * - resultados/{mesId} -> (NUEVO) historial de cálculos automáticos
 */
export const useFirestore = (mesId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datosMes, setDatosMes] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  
  // Cargar TODOS los datos del mes (estado, recibos, habitantes)
  const cargarDatosMes = async () => {
    if (!mesId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // 1. Cargar estado del mes desde colección 'meses'
      const mesRef = doc(db, 'meses', mesId);
      const mesSnap = await getDoc(mesRef);
      
      let estado = 'abierto';
      if (mesSnap.exists()) {
        estado = mesSnap.data().estado;
      } else {
        // Crear mes si no existe
        await setDoc(mesRef, { 
          estado: 'abierto',
          fechaCreacion: new Date().toISOString()
        });
      }
      
      // 2. Cargar recibos desde colección 'recibos'
      const recibosRef = doc(db, 'recibos', mesId);
      const recibosSnap = await getDoc(recibosRef);
      const recibos = recibosSnap.exists() ? recibosSnap.data() : {};
      
      // 3. Cargar habitantes desde colección 'habitantes'
      const habitantesRef = collection(db, 'habitantes', mesId, 'departamentos');
      const habitantesSnap = await getDocs(habitantesRef);
      
      const habitantesList = [];
      habitantesSnap.forEach(doc => {
        habitantesList.push({
          numero: doc.id,
          ...doc.data()
        });
      });
      
      // Ordenar por número de departamento
      habitantesList.sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
      
      // 4. Combinar todos los datos
      setDatosMes({
        id: mesId,
        estado: estado,
        recibos: recibos
      });
      
      setDepartamentos(habitantesList);
      
    } catch (err) {
      console.error('Error al cargar datos del mes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Guardar habitantes de un departamento
  const guardarHabitantes = async (numeroDpto, habitantes) => {
    if (!mesId) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const dptoRef = doc(db, 'habitantes', mesId, 'departamentos', numeroDpto);
      await setDoc(dptoRef, {
        habitantes: parseInt(habitantes),
        timestamp: serverTimestamp()
      });
      
      await cargarDatosMes();
      return true;
    } catch (err) {
      console.error('Error al guardar habitantes:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Registrar monto de agua
  const registrarAgua = async (monto) => {
    if (!mesId) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const recibosRef = doc(db, 'recibos', mesId);
      const recibosSnap = await getDoc(recibosRef);
      const datosActuales = recibosSnap.exists() ? recibosSnap.data() : {};
      
      await setDoc(recibosRef, {
        ...datosActuales,
        agua: {
          monto: parseFloat(monto),
          fecha: new Date().toISOString(),
          registradoPor: 'vecino'
        }
      });
      
      await cargarDatosMes();
      return true;
    } catch (err) {
      console.error('Error al registrar agua:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Registrar monto de luz
  const registrarLuz = async (monto) => {
    if (!mesId) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const recibosRef = doc(db, 'recibos', mesId);
      const recibosSnap = await getDoc(recibosRef);
      const datosActuales = recibosSnap.exists() ? recibosSnap.data() : {};
      
      await setDoc(recibosRef, {
        ...datosActuales,
        luz: {
          monto: parseFloat(monto),
          fecha: new Date().toISOString(),
          registradoPor: 'vecino'
        }
      });
      
      await cargarDatosMes();
      return true;
    } catch (err) {
      console.error('Error al registrar luz:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Registrar monto de limpieza
  const registrarLimpieza = async (monto) => {
    if (!mesId) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const recibosRef = doc(db, 'recibos', mesId);
      const recibosSnap = await getDoc(recibosRef);
      const datosActuales = recibosSnap.exists() ? recibosSnap.data() : {};
      
      await setDoc(recibosRef, {
        ...datosActuales,
        limpieza: {
          monto: parseFloat(monto),
          fecha: new Date().toISOString(),
          registradoPor: 'vecino'
        }
      });
      
      await cargarDatosMes();
      return true;
    } catch (err) {
      console.error('Error al registrar limpieza:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- NUEVA FUNCIÓN: GUARDADO SILENCIOSO DE RESULTADOS ---
  const guardarResultados = async (resultadosCalculados) => {
    if (!mesId || !resultadosCalculados) return;
    
    try {
      // No usamos setLoading(true) para no interrumpir al usuario mientras tipea
      const resultadoRef = doc(db, 'resultados', mesId);
      
      await setDoc(resultadoRef, {
        mesId: mesId,
        ...resultadosCalculados,
        ultimaActualizacion: new Date().toISOString()
      });
      
      console.log('Resultados sincronizados automáticamente en BD');
    } catch (err) {
      console.error('Error en el autoguardado de resultados:', err);
      // No mostramos error en pantalla para no molestar, solo en consola
    }
  };
  
  // Cerrar el mes
  const cerrarMes = async () => {
    if (!mesId) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const mesRef = doc(db, 'meses', mesId);
      await setDoc(mesRef, {
        estado: 'cerrado',
        fechaCierre: new Date().toISOString()
      });
      
      await cargarDatosMes();
      return true;
    } catch (err) {
      console.error('Error al cerrar mes:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Reabrir mes
  const reabrirMes = async () => {
    if (!mesId) return false;
    
    try {
      setLoading(true);
      const mesRef = doc(db, 'meses', mesId);
      await setDoc(mesRef, {
        estado: 'abierto',
        fechaReapertura: new Date().toISOString()
      });
      await cargarDatosMes();
      return true;
    } catch (err) {
      console.error('Error al reabrir mes:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Eliminar registro de departamento
  const eliminarDepartamento = async (numeroDpto) => {
    if (!mesId) return false;
    
    try {
      setLoading(true);
      const dptoRef = doc(db, 'habitantes', mesId, 'departamentos', numeroDpto);
      await deleteDoc(dptoRef);
      await cargarDatosMes();
      return true;
    } catch (err) {
      console.error('Error al eliminar departamento:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Traer todos los meses que tienen resultados guardados
  const obtenerHistorialResultados = async () => {
    try {
      setLoading(true);
      const resultadosRef = collection(db, 'resultados');
      const querySnapshot = await getDocs(resultadosRef);
      
      const historial = [];
      querySnapshot.forEach((doc) => {
        historial.push({
          id: doc.id, // el mesId (ej: 2026-05)
          ...doc.data()
        });
      });

      // Ordenar por fecha (el más reciente primero)
      return historial.sort((a, b) => b.id.localeCompare(a.id));
    } catch (err) {
      console.error("Error al obtener historial:", err);
      setError("No se pudo cargar el historial");
      return [];
    } finally {
      setLoading(false);
    }
  };
  // Cargar datos iniciales
  useEffect(() => {
    if (mesId) {
      cargarDatosMes();
    }
  }, [mesId]);
  
  return {
    loading,
    error,
    datosMes,
    departamentos,
    guardarHabitantes,
    registrarAgua,
    registrarLuz,
    registrarLimpieza,
    cerrarMes,
    reabrirMes,
    eliminarDepartamento,
    guardarResultados, // <--- FUNCIÓN EXPORTADA CORRECTAMENTE
    obtenerHistorialResultados, // <--- FUNCIÓN EXPORTADA CORRECTAMENTE
    recargar: cargarDatosMes
  };
};