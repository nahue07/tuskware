// src/components/Clientes.jsx
import { useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection,
  addDoc,
  getDocs
} from 'firebase/firestore'
import { FaWhatsapp } from 'react-icons/fa'
import { createPortal } from 'react-dom'

export default function Clientes({ onUpdateFacturacion }) {
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState({
    nombre: '',
    numero: '',
    monto: '',
    metodo: 'efectivo'
  })
  const [filtroMetodo, setFiltroMetodo] = useState('todos')
  const [toastMsg, setToastMsg] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const isValidPhoneNumber = (numero) => {
    return /^\d{10,15}$/.test(numero)
  }

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type })
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.numero || !form.monto) return showToast('❌ Faltan campos', 'error')
    if (!isValidPhoneNumber(form.numero)) return showToast('📵 Número inválido (10 a 15 dígitos)', 'error')
    try {
      await addDoc(collection(db, 'clientes'), {
        ...form,
        monto: parseFloat(form.monto)
      })
      setForm({ nombre: '', numero: '', monto: '', metodo: 'efectivo' })
      showToast('✅ Cliente guardado exitosamente')
      fetchClientes()
    } catch (err) {
      console.error(err)
    }
  }

  const fetchClientes = async () => {
    try {
      const snap = await getDocs(collection(db, 'clientes'))
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setClientes(data)

      const total = data.reduce((acc, c) => acc + (parseFloat(c.monto) || 0), 0)
      console.log("💸 Total facturado:", total)
      if (onUpdateFacturacion) onUpdateFacturacion(total)
    } catch (err) {
      console.error("❌ Error al obtener clientes:", err)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const totalPagos = clientes.reduce((acc, c) => acc + (c.monto || 0), 0)
  const metodos = clientes.reduce((acc, c) => {
    acc[c.metodo] = (acc[c.metodo] || 0) + 1
    return acc
  }, {})

  const clientesFiltrados = filtroMetodo === 'todos' ? clientes : clientes.filter(c => c.metodo === filtroMetodo)

  const enviarWhatsApp = (numero, nombre) => {
    const mensaje = encodeURIComponent(`Hola ${nombre}, gracias por tu pago.`)
    window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank')
  }

  return (
    <div className="p-4 max-w-4xl mx-auto animate-fade-in transition-all duration-500 bg-gray-50 text-black border border-gray-300 rounded-xl">
      <h1 className="text-3xl font-bold mb-6 text-center tracking-tight">📋 Registro</h1>

      {toastMsg && createPortal(
        <div className={`fixed top-5 right-5 z-50 px-4 py-2 rounded shadow-xl text-white animate-fade-in transition-all duration-300 ${toastMsg.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toastMsg.msg}
        </div>,
        document.body
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-lg mb-8 transition-all duration-300">
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white text-black" />
        <input name="numero" value={form.numero} onChange={handleChange} placeholder="Número" className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white text-black" />
        <input name="monto" type="number" value={form.monto} onChange={handleChange} placeholder="Monto" className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white text-black" />
        <select name="metodo" value={form.metodo} onChange={handleChange} className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white text-black">
          <option value="efectivo">💵 Efectivo</option>
          <option value="mercado_pago">📱 Mercado Pago</option>
          <option value="transferencia">🏦 Transferencia</option>
        </select>
        <button type="submit" className="col-span-1 sm:col-span-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold transition-all duration-300">Guardar Cliente</button>
      </form>

      <div className="mb-6">
        <label className="mr-2 font-semibold">Filtrar por método:</label>
        <select value={filtroMetodo} onChange={e => setFiltroMetodo(e.target.value)} className="border p-2 rounded transition-all bg-white text-black">
          <option value="todos">Todos</option>
          <option value="efectivo">💵 Efectivo</option>
          <option value="mercado_pago">📱 Mercado Pago</option>
          <option value="transferencia">🏦 Transferencia</option>
        </select>
      </div>

      <div className="mb-6 bg-white p-4 rounded-xl shadow-md transition-all">
        <h2 className="font-semibold mb-2">📊 Estadísticas</h2>
        <p>Total recaudado: <strong>${totalPagos.toFixed(2)}</strong></p>
        <ul className="list-disc list-inside text-sm">
          {Object.entries(metodos).map(([k, v]) => (
            <li key={k}>{k}: {v} clientes</li>
          ))}
        </ul>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full text-left border border-gray-200 rounded-lg overflow-hidden shadow-md transition-all">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3">Acción</th>
              <th className="border p-3">Nombre</th>
              <th className="border p-3">Número</th>
              <th className="border p-3">Monto</th>
              <th className="border p-3">Método</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map(c => (
              <tr key={c.id} className="hover:bg-blue-100 transition-all duration-200">
                <td className="border p-3 text-center whitespace-nowrap">
                  <button
                    onClick={() => enviarWhatsApp(c.numero, c.nombre)}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-all"
                  >
                    <FaWhatsapp className="text-lg" /> WhatsApp
                  </button>
                </td>
                <td className="border p-3">{c.nombre}</td>
                <td className="border p-3">{c.numero}</td>
                <td className="border p-3">${c.monto.toFixed(2)}</td>
                <td className="border p-3">{c.metodo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
