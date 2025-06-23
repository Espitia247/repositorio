import tkinter as tk
from tkinter import messagebox, simpledialog, ttk
from PIL import Image, ImageTk
import smtplib
from email.message import EmailMessage

# === Usuarios ===
usuarios = {
    "admin": {"password": "1234", "email": "tucorreo@gmail.com"},
    "usuario": {"password": "abcd", "email": "tucorreo@gmail.com"}
}

# === Correo remitente ===
CORREO_REMITENTE = "tucorreo@gmail.com"
CONTRASENA_REMITENTE = "tu_contraseña_app"

def enviar_correo(destinatario, contraseña):
    msg = EmailMessage()
    msg.set_content(f"Hola, tu contraseña es: {contraseña}")
    msg["Subject"] = "Recuperación de contraseña"
    msg["From"] = CORREO_REMITENTE
    msg["To"] = destinatario

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(CORREO_REMITENTE, CONTRASENA_REMITENTE)
            smtp.send_message(msg)
        messagebox.showinfo("Correo enviado", f"Se ha enviado tu contraseña a: {destinatario}")
    except Exception as e:
        messagebox.showerror("Error", f"No se pudo enviar el correo: {e}")

def verificar_login():
    usuario = entry_usuario.get()
    contraseña = entry_contraseña.get()
    if usuario in usuarios and usuarios[usuario]["password"] == contraseña:
        messagebox.showinfo("Login exitoso", f"¡Bienvenido, {usuario}!")
    else:
        messagebox.showerror("Error", "Usuario o contraseña incorrectos.")

def recuperar_contraseña():
    usuario = simpledialog.askstring("Recuperar contraseña", "Ingresa tu nombre de usuario:")
    if usuario in usuarios:
        correo = usuarios[usuario]["email"]
        contraseña = usuarios[usuario]["password"]
        enviar_correo(correo, contraseña)
    else:
        messagebox.showerror("Error", "El usuario no existe.")

# === Ventana principal ===
ventana = tk.Tk()
ventana.title("Login de Empresa")
ventana.geometry("360x460")
ventana.configure(bg="#f4f4f4")

# Icono de la ventana (barra de título)
try:
    ventana.iconbitmap("logo.ico")  # Cambia si tienes un .ico
except:
    pass

# === Estilos ===
style = ttk.Style()
style.configure("TLabel", font=("Arial", 12))
style.configure("TEntry", font=("Arial", 12))
style.configure("TButton", font=("Arial", 11), padding=6)

# === Frame principal ===
frame = ttk.Frame(ventana, padding=20)
frame.pack(expand=True)

# === Logo centrado ===
try:
    imagen_logo = Image.open("")  # Cambia por tu imagen
    imagen_logo = imagen_logo.resize((120, 120))
    logo = ImageTk.PhotoImage(imagen_logo)
    label_logo = ttk.Label(frame, image=logo)
    label_logo.image = logo
    label_logo.pack(pady=(0, 10))  # margen inferior
except:
    pass

# === Campos ===
ttk.Label(frame, text="Usuario:").pack(pady=5)
entry_usuario = ttk.Entry(frame, width=30)
entry_usuario.pack()

ttk.Label(frame, text="Contraseña:").pack(pady=5)
entry_contraseña = ttk.Entry(frame, show="*", width=30)
entry_contraseña.pack()

# === Botones ===
ttk.Button(frame, text="Iniciar sesión", command=verificar_login).pack(pady=15)
ttk.Button(frame, text="¿Olvidaste tu contraseña?", command=recuperar_contraseña).pack()

# === Ejecutar ===
ventana.mainloop()
