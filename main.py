import socket
import threading
import subprocess
import platform
import ipaddress
from datetime import datetime

from kivy.app import App
from kivy.lang import Builder
from kivy.clock import Clock
from kivy.metrics import dp
from kivy.core.window import Window
from kivy.uix.popup import Popup
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.button import Button

APP_TITLE = "ZIG HOST CHECKER"
OWNER_NUMBERS = "263777493086\n2637777333388\n26371467890"
WHATSAPP_CHANNEL_URL = "PUT_YOUR_WHATSAPP_CHANNEL_LINK_HERE"

KV = r"""
#:import dp kivy.metrics.dp
BoxLayout:
    orientation: "vertical"
    canvas.before:
        Color:
            rgba: 0.025, 0.04, 0.075, 1
        Rectangle:
            pos: self.pos
            size: self.size
    BoxLayout:
        size_hint_y: None
        height: dp(66)
        padding: dp(10)
        spacing: dp(10)
        canvas.before:
            Color:
                rgba: 0.02, 0.12, 0.25, 1
            Rectangle:
                pos: self.pos
                size: self.size
        Image:
            source: "assets/zig_host_checker_logo.png"
            size_hint_x: None
            width: dp(52)
            allow_stretch: True
            keep_ratio: True
        BoxLayout:
            orientation: "vertical"
            Label:
                text: "[b]ZIG HOST CHECKER[/b]"
                markup: True
                color: 0.2, 0.85, 1, 1
                halign: "left"
                valign: "middle"
                text_size: self.size
            Label:
                text: "NETWORK DIAGNOSTICS"
                color: 0.3, 1, 0.35, 1
                font_size: "10sp"
                halign: "left"
                valign: "middle"
                text_size: self.size
        Button:
            text: "☰"
            size_hint_x: None
            width: dp(48)
            background_normal: ""
            background_color: 0.02, 0.35, 0.65, 1
            on_release: app.open_menu()
    ScrollView:
        do_scroll_x: False
        BoxLayout:
            orientation: "vertical"
            padding: dp(12)
            spacing: dp(10)
            size_hint_y: None
            height: self.minimum_height
            Label:
                text: "Check hosts you own or have permission to test."
                size_hint_y: None
                height: dp(30)
                color: 0.85, 0.9, 1, 1
                font_size: "12sp"
            Label:
                text: "PING HOST"
                size_hint_y: None
                height: dp(28)
                color: 0.2, 0.85, 1, 1
                bold: True
                halign: "left"
                text_size: self.size
            TextInput:
                id: ping_host
                hint_text: "Hostname or IP (e.g. example.com)"
                multiline: False
                size_hint_y: None
                height: dp(46)
                foreground_color: 1, 1, 1, 1
                background_color: 0.06, 0.09, 0.15, 1
                cursor_color: 0.2, 0.85, 1, 1
            Button:
                text: "PING / CHECK ONLINE"
                size_hint_y: None
                height: dp(46)
                background_normal: ""
                background_color: 0.02, 0.42, 0.78, 1
                on_release: app.ping_host(ping_host.text)
            Label:
                text: "SUBDOMAIN / DNS LOOKUP"
                size_hint_y: None
                height: dp(28)
                color: 0.2, 0.85, 1, 1
                bold: True
                halign: "left"
                text_size: self.size
            TextInput:
                id: dns_host
                hint_text: "Domain (e.g. example.com)"
                multiline: False
                size_hint_y: None
                height: dp(46)
                foreground_color: 1, 1, 1, 1
                background_color: 0.06, 0.09, 0.15, 1
            Button:
                text: "LOOK UP DOMAIN + COMMON SUBDOMAINS"
                size_hint_y: None
                height: dp(46)
                background_normal: ""
                background_color: 0.02, 0.42, 0.78, 1
                on_release: app.dns_lookup(dns_host.text)
            Label:
                text: "PRIVATE NETWORK SCANNER"
                size_hint_y: None
                height: dp(28)
                color: 0.2, 0.85, 1, 1
                bold: True
                halign: "left"
                text_size: self.size
            TextInput:
                id: network_range
                hint_text: "Private CIDR only (e.g. 192.168.1.0/24)"
                multiline: False
                size_hint_y: None
                height: dp(46)
                foreground_color: 1, 1, 1, 1
                background_color: 0.06, 0.09, 0.15, 1
            Button:
                text: "SCAN SMALL PRIVATE RANGE"
                size_hint_y: None
                height: dp(46)
                background_normal: ""
                background_color: 0.05, 0.5, 0.22, 1
                on_release: app.scan_network(network_range.text)
            Label:
                text: "OUTPUT / DETAILS"
                size_hint_y: None
                height: dp(28)
                color: 0.2, 0.85, 1, 1
                bold: True
                halign: "left"
                text_size: self.size
            TextInput:
                id: output
                text: "Welcome to ZIG HOST CHECKER.\\n\\nUse only on systems and networks you own or are authorised to test.\\n"
                readonly: True
                multiline: True
                size_hint_y: None
                height: dp(250)
                foreground_color: 0.9, 1, 0.95, 1
                background_color: 0.015, 0.025, 0.045, 1
                cursor_color: 0.2, 0.85, 1, 1
            BoxLayout:
                size_hint_y: None
                height: dp(46)
                spacing: dp(8)
                Button:
                    text: "COPY OUTPUT"
                    background_normal: ""
                    background_color: 0.02, 0.35, 0.65, 1
                    on_release: app.copy_output()
                Button:
                    text: "CLEAR"
                    background_normal: ""
                    background_color: 0.55, 0.08, 0.12, 1
                    on_release: app.clear_output()
    Label:
        text: "© ZIGALY XR  |  Host diagnostics"
        size_hint_y: None
        height: dp(26)
        color: 0.55, 0.65, 0.75, 1
        font_size: "10sp"
"""

def stamp():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

class ZigHostCheckerApp(App):
    title = APP_TITLE

    def build(self):
        Window.clearcolor = (0.025, 0.04, 0.075, 1)
        self.root = Builder.load_string(KV)
        Clock.schedule_once(lambda _dt: self.welcome(), 0.4)
        return self.root

    def welcome(self):
        message = (
            "You are using Host Checker created by ZIGALY XR.\n\n"
            "Do not use it for illegal activities.\n"
            "Do not edit or redistribute the APK without the owner's permission.\n"
            "Do not misuse this app. Only test systems you own or are authorised to test."
        )
        self.popup("WELCOME", message)

    def popup(self, title, message, buttons=True):
        box = BoxLayout(orientation="vertical", padding=dp(12), spacing=dp(10))
        box.add_widget(Label(text=message, halign="left", valign="middle"))
        if buttons:
            btn = Button(text="OK", size_hint_y=None, height=dp(44))
            box.add_widget(btn)
        pop = Popup(title=title, content=box, size_hint=(0.88, 0.55), auto_dismiss=False)
        if buttons:
            btn.bind(on_release=pop.dismiss)
        pop.open()

    def append_output(self, text):
        out = self.root.ids.output
        out.text = out.text + f"\n[{stamp()}] {text}\n"
        out.cursor = (0, len(out.text))
        out.scroll_y = 0

    def run_bg(self, func, *args):
        threading.Thread(target=func, args=args, daemon=True).start()

    def ping_host(self, host):
        host = host.strip()
        if not host:
            self.append_output("Enter a hostname or IP address.")
            return
        self.append_output(f"Checking {host} ...")
        self.run_bg(self._ping_worker, host)

    def _ping_worker(self, host):
        try:
            ip = socket.gethostbyname(host)
        except Exception as e:
            Clock.schedule_once(lambda _dt: self.append_output(f"DNS ERROR: {e}"))
            return
        # A single OS ping is used; no flood or repeated probing.
        count_flag = "-n" if platform.system().lower() == "windows" else "-c"
        cmd = ["ping", count_flag, "1", "-W", "2", host]
        start = __import__("time").perf_counter()
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=4)
            elapsed = round((__import__("time").perf_counter() - start) * 1000, 1)
            online = result.returncode == 0
            status = "ONLINE ✓" if online else "NO PING REPLY / OFFLINE OR FILTERED"
            msg = f"{host} -> IP: {ip}\nStatus: {status}\nPing time: {elapsed} ms\nNote: firewalls may block ping."
        except Exception as e:
            msg = f"{host} -> IP: {ip}\nPing unavailable: {e}"
        Clock.schedule_once(lambda _dt, m=msg: self.append_output(m))

    def dns_lookup(self, domain):
        domain = domain.strip().lower().rstrip(".")
        if not domain or " " in domain or "." not in domain:
            self.append_output("Enter a valid domain, e.g. example.com")
            return
        self.append_output(f"DNS lookup for {domain} ...")
        self.run_bg(self._dns_worker, domain)

    def _dns_worker(self, domain):
        lines = [f"DNS results for {domain}:"]
        try:
            records = sorted({item[4][0] for item in socket.getaddrinfo(domain, None, type=socket.SOCK_STREAM)})
            lines.append("A/AAAA addresses: " + ", ".join(records))
        except Exception as e:
            lines.append(f"Domain lookup failed: {e}")
        # Common names only; modest sequential DNS lookups, no brute force.
        common = ["www", "mail", "ftp", "api", "blog", "portal", "dev", "test"]
        lines.append("Common subdomain checks:")
        for prefix in common:
            name = f"{prefix}.{domain}"
            try:
                found = sorted({item[4][0] for item in socket.getaddrinfo(name, None, type=socket.SOCK_STREAM)})
                lines.append(f"{name} -> {', '.join(found)}")
            except Exception:
                lines.append(f"{name} -> no DNS result")
        msg = "\n".join(lines)
        Clock.schedule_once(lambda _dt, m=msg: self.append_output(m))

    def scan_network(self, cidr):
        cidr = cidr.strip()
        try:
            net = ipaddress.ip_network(cidr, strict=False)
        except Exception:
            self.append_output("Invalid network range. Example: 192.168.1.0/24")
            return
        if not net.is_private:
            self.append_output("Blocked: this scanner accepts private IPv4 ranges only.")
            return
        if net.version != 4 or net.num_addresses > 256:
            self.append_output("Range too large. Use an IPv4 private range with at most 256 addresses.")
            return
        self.append_output(f"Scanning {net} (authorised private network only) ...")
        self.run_bg(self._scan_worker, str(net))

    def _scan_worker(self, cidr):
        net = ipaddress.ip_network(cidr, strict=False)
        found = []
        # Small, sequential TCP connect check to common service ports; no exploitation.
        ports = (80, 443, 22, 53, 8080)
        for address in net.hosts():
            ip = str(address)
            responsive = []
            for port in ports:
                try:
                    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                        sock.settimeout(0.22)
                        if sock.connect_ex((ip, port)) == 0:
                            responsive.append(port)
                except Exception:
                    pass
            if responsive:
                found.append(f"{ip} | open TCP ports: {', '.join(map(str, responsive))}")
        msg = "Private network scan complete.\n" + ("\n".join(found) if found else "No checked services responded. Devices may still be online.")
        Clock.schedule_once(lambda _dt, m=msg: self.append_output(m))

    def copy_output(self):
        try:
            from kivy.core.clipboard import Clipboard
            Clipboard.copy(self.root.ids.output.text)
            self.append_output("Output copied to clipboard.")
        except Exception as e:
            self.append_output(f"Clipboard error: {e}")

    def clear_output(self):
        self.root.ids.output.text = ""

    def open_menu(self):
        box = BoxLayout(orientation="vertical", padding=dp(12), spacing=dp(8))
        options = [
            ("CONTACT / OWNER INFO", self.contact_info),
            ("WHATSAPP CHANNEL", self.whatsapp_info),
            ("ABOUT", self.about_info),
        ]
        pop = Popup(title="ZIG HOST CHECKER MENU", content=box, size_hint=(0.88, 0.52))
        for title, callback in options:
            b = Button(text=title, size_hint_y=None, height=dp(46))
            b.bind(on_release=lambda _b, cb=callback: (pop.dismiss(), cb()))
            box.add_widget(b)
        close = Button(text="CLOSE", size_hint_y=None, height=dp(42))
        close.bind(on_release=pop.dismiss)
        box.add_widget(close)
        pop.open()

    def contact_info(self):
        self.popup("OWNER INFO", "Developed by ZIGALY XR\n\nOwner contact numbers:\n" + OWNER_NUMBERS +
                   "\n\n“This Host Checker is developed by ZIGALY XR. For more apps, join us on WhatsApp.”")

    def whatsapp_info(self):
        from kivy.utils import platform as kivy_platform
        try:
            import webbrowser
            if WHATSAPP_CHANNEL_URL.startswith("https://"):
                webbrowser.open(WHATSAPP_CHANNEL_URL)
                self.append_output("Opening WhatsApp channel...")
            else:
                self.popup("WHATSAPP CHANNEL", "Add your real WhatsApp Channel URL in main.py by replacing:\nPUT_YOUR_WHATSAPP_CHANNEL_LINK_HERE")
        except Exception as e:
            self.append_output(f"Could not open WhatsApp: {e}")

    def about_info(self):
        self.popup("ABOUT", "ZIG HOST CHECKER\nVersion 1.0\n\nFeatures:\n• Host/IP lookup and single ping\n• IP address display\n• Common subdomain DNS checks\n• Small private IPv4 network scanner\n• Output log and copy function\n\nUse responsibly and only with permission.")

    def on_request_close(self, *args):
        box = BoxLayout(orientation="vertical", padding=dp(12), spacing=dp(12))
        box.add_widget(Label(text="Do you want to exit this app?"))
        row = BoxLayout(size_hint_y=None, height=dp(46), spacing=dp(8))
        yes = Button(text="YES", background_color=(0.65, 0.08, 0.12, 1))
        no = Button(text="NO", background_color=(0.02, 0.42, 0.78, 1))
        row.add_widget(yes)
        row.add_widget(no)
        box.add_widget(row)
        pop = Popup(title="EXIT CONFIRMATION", content=box, size_hint=(0.82, 0.3), auto_dismiss=False)
        yes.bind(on_release=lambda *_: (pop.dismiss(), App.get_running_app().stop()))
        no.bind(on_release=pop.dismiss)
        pop.open()
        return True

if __name__ == "__main__":
    ZigHostCheckerApp().run()
