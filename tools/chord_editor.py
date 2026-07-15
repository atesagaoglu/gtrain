#!/usr/bin/env python3
"""
Chord Editor - Tkinter utility for curating chordDb.json
"""

import json
import os
import tkinter as tk
from tkinter import ttk, filedialog, messagebox

class ChordEditorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("GTrain Chord Database Editor")
        self.root.geometry("800x600")

        self.db = None
        self.filepath = None
        self.selected_root = None
        self.selected_type = None
        self.selected_voicing_idx = None

        self.create_widgets()
        
        # Try to load default db
        default_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "chordDb.json")
        if os.path.exists(default_path):
            self.load_file(default_path)

    def create_widgets(self):
        # Top toolbar
        toolbar = ttk.Frame(self.root, padding=5)
        toolbar.pack(side=tk.TOP, fill=tk.X)
        
        ttk.Button(toolbar, text="Load JSON", command=self.open_file).pack(side=tk.LEFT, padx=5)
        ttk.Button(toolbar, text="Save", command=self.save_file).pack(side=tk.LEFT, padx=5)
        ttk.Button(toolbar, text="Save As...", command=self.save_as_file).pack(side=tk.LEFT, padx=5)
        
        self.lbl_status = ttk.Label(toolbar, text="No file loaded")
        self.lbl_status.pack(side=tk.RIGHT, padx=5)

        # Main PanedWindow
        paned = ttk.PanedWindow(self.root, orient=tk.HORIZONTAL)
        paned.pack(expand=True, fill=tk.BOTH, padx=5, pady=5)

        # Left pane: TreeView
        left_frame = ttk.Frame(paned)
        paned.add(left_frame, weight=1)

        self.tree = ttk.Treeview(left_frame)
        self.tree.pack(expand=True, fill=tk.BOTH)
        self.tree.bind("<<TreeviewSelect>>", self.on_tree_select)
        
        scrollbar = ttk.Scrollbar(left_frame, orient="vertical", command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        # Right pane: Details & Editor
        right_frame = ttk.Frame(paned, padding=10)
        paned.add(right_frame, weight=2)

        ttk.Label(right_frame, text="Voicing Details", font=("TkDefaultFont", 12, "bold")).pack(anchor=tk.W, pady=(0, 10))

        # Detail fields
        self.details_var = tk.StringVar()
        lbl_details = ttk.Label(right_frame, textvariable=self.details_var, justify=tk.LEFT, anchor=tk.NW)
        lbl_details.pack(fill=tk.BOTH, expand=True)

        # Actions
        btn_frame = ttk.Frame(right_frame)
        btn_frame.pack(fill=tk.X, pady=10)
        
        self.btn_delete = ttk.Button(btn_frame, text="Delete Selected Voicing", state=tk.DISABLED, command=self.delete_voicing)
        self.btn_delete.pack(side=tk.LEFT)

    def load_file(self, filepath):
        try:
            with open(filepath, "r") as f:
                self.db = json.load(f)
            self.filepath = filepath
            self.lbl_status.config(text=f"Loaded: {os.path.basename(filepath)}")
            self.populate_tree()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load JSON:\n{e}")

    def open_file(self):
        path = filedialog.askopenfilename(filetypes=[("JSON Files", "*.json")])
        if path:
            self.load_file(path)

    def save_file(self):
        if not self.db or not self.filepath:
            return
        try:
            with open(self.filepath, "w") as f:
                json.dump(self.db, f, indent=2)
            self.lbl_status.config(text=f"Saved: {os.path.basename(self.filepath)}")
            messagebox.showinfo("Success", "File saved successfully.")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save JSON:\n{e}")

    def save_as_file(self):
        if not self.db:
            return
        path = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON Files", "*.json")])
        if path:
            self.filepath = path
            self.save_file()

    def populate_tree(self):
        self.tree.delete(*self.tree.get_children())
        if not self.db or "voicings" not in self.db:
            return

        voicings = self.db["voicings"]
        for root_note, types in voicings.items():
            root_node = self.tree.insert("", tk.END, text=root_note, open=False)
            for chord_type, v_list in types.items():
                type_node = self.tree.insert(root_node, tk.END, text=f"{chord_type} ({len(v_list)})", open=False)
                for idx, v in enumerate(v_list):
                    self.tree.insert(type_node, tk.END, text=v["id"], values=(root_note, chord_type, idx))

    def on_tree_select(self, event):
        selected = self.tree.selection()
        if not selected:
            self.clear_details()
            return
        
        item = self.tree.item(selected[0])
        values = item.get("values")
        
        if not values or len(values) < 3:
            self.clear_details()
            return

        self.selected_root = values[0]
        self.selected_type = values[1]
        self.selected_voicing_idx = int(values[2])
        
        voicing = self.db["voicings"][self.selected_root][self.selected_type][self.selected_voicing_idx]
        
        details = f"ID: {voicing['id']}\n"
        details += f"Frets: {voicing['frets']}\n"
        details += f"Notes: {voicing['notes']}\n"
        details += f"Min Fret: {voicing['minFret']}\n"
        details += f"Bar Fret: {voicing['barFret']}\n"
        details += f"Is Open: {voicing['isOpen']}\n"
        details += f"Root in Bass: {voicing.get('rootInBass', 'N/A')}\n"
        
        self.details_var.set(details)
        self.btn_delete.config(state=tk.NORMAL)

    def clear_details(self):
        self.selected_root = None
        self.selected_type = None
        self.selected_voicing_idx = None
        self.details_var.set("")
        self.btn_delete.config(state=tk.DISABLED)

    def delete_voicing(self):
        if self.selected_root is None:
            return
        
        voicings_list = self.db["voicings"][self.selected_root][self.selected_type]
        deleted_id = voicings_list[self.selected_voicing_idx]["id"]
        
        if messagebox.askyesno("Confirm Delete", f"Are you sure you want to delete {deleted_id}?"):
            del voicings_list[self.selected_voicing_idx]
            self.populate_tree()
            self.clear_details()
            self.lbl_status.config(text=f"Deleted {deleted_id}. Unsaved changes.")

if __name__ == "__main__":
    root = tk.Tk()
    app = ChordEditorApp(root)
    root.mainloop()
