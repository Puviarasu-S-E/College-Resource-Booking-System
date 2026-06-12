"use client";
import { useState } from "react";
import { Resource } from "@/types";
import { gqlRequest } from "@/lib/gqlClient";

const ADD_RESOURCE = `
  mutation($name: String!, $category: String!, $description: String!) {
    addResource(name: $name, category: $category, description: $description) { id name category description }
  }
`;

const UPDATE_RESOURCE = `
  mutation($id: ID!, $name: String, $category: String, $description: String) {
    updateResource(id: $id, name: $name, category: $category, description: $description) { id name category description }
  }
`;

const DELETE_RESOURCE = `
  mutation($id: ID!) { deleteResource(id: $id) }
`;

const emptyForm = { id: "", name: "", category: "", description: "" };

const CATEGORIES = ["Classroom", "Laboratory", "Seminar Hall", "Projector", "Sports Facility"];

export default function AdminResourcesClient({ resources: initial }: { resources: Resource[] }) {
  const [resources, setResources] = useState(initial);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [...new Set(resources.map((r) => r.category))];
  const filtered = categoryFilter ? resources.filter((r) => r.category === categoryFilter) : resources;

  function openAdd() {
    setForm(emptyForm);
    setModal("add");
  }

  function openEdit(r: Resource) {
    setForm({ id: String(r.id), name: r.name, category: r.category, description: r.description });
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (modal === "add") {
        // Create new resource and add it to the list
        const data = await gqlRequest<{ addResource: Resource }>(ADD_RESOURCE, {
          name: form.name,
          category: form.category,
          description: form.description,
        });
        setResources([...resources, data.addResource]);
      } else {
        // Update existing resource in the list
        const data = await gqlRequest<{ updateResource: Resource }>(UPDATE_RESOURCE, form);
        setResources(resources.map((r) => r.id === form.id ? data.updateResource : r));
      }
      closeModal();
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resource?")) return;
    await gqlRequest(DELETE_RESOURCE, { id });
    setResources(resources.filter((r) => r.id !== id));
  }

  return (
    <>
      <div className="page-header">
        <h1>Resources</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Resource</button>
      </div>

      {/* Category filter */}
      <div className="filter-bar">
        <button className={`filter-pill${!categoryFilter ? " active" : ""}`} onClick={() => setCategoryFilter("")}>All</button>
        {categories.map((c) => (
          <button key={c} className={`filter-pill${categoryFilter === c ? " active" : ""}`} onClick={() => setCategoryFilter(c)}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No resources yet. Add one!</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Category</th><th>Description</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td><span className="badge badge-approved">{r.category}</span></td>
                  <td style={{ maxWidth: 300, color: "var(--text-muted)" }}>{r.description}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(String(r.id))}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modal === "add" ? "Add Resource" : "Edit Resource"}</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
