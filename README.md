# AksharaFlow – Tamil Keyboard

AksharaFlow is a highly responsive, bilingual keyboard overlay Chrome Extension that allows you to type in Tamil seamlessly within almost any text field on the web. It is designed to be unobtrusive but instantly accessible when you need it.

## 🚀 Features

- **Universal Compatibility**: Works out of the box on standard `<input>` and `<textarea>` elements, as well as complex rich-text editors and `contenteditable` fields (e.g., ChatGPT, Claude, Notion, Google Docs).
- **On-Screen Keyboard & FAB**: Features a Floating Action Button (FAB) and a draggable virtual keyboard pad that remains accessible on any webpage without stealing focus.
- **Smart Key Mapping**: 
  - **Consonants & Short Vowels**: Mapped logically to standard alphabetical keys (e.g., `a` → அ, `k` → க).
  - **Long Vowels**: Mapped to standard number keys (e.g., `1` → ஆ, `2` → ஈ).
  - **Matras (Modifiers)**: Mapped to Shift + number symbols (e.g., `!` → ா, `@` → ி).
- **Non-intrusive Focus Management**: Typing via the on-screen keyboard immediately inserts the character and restores the cursor exactly where you left off.
- **Hot-swappable**: Toggle the extension on or off instantly using the keyboard pad switch or extension popup.

## 🛠️ Technical Details

- Built entirely with **Vanilla JavaScript, HTML, and CSS**. No heavy frameworks or dependencies.
- **Content Scripts (`content.js`)**: Injects the UI overlay and the core keystroke interception logic into web pages. It listens to `keydown` events to override standard English keystrokes with mapped Tamil characters.
- **Background Worker (`background.js`)**: Manages the extension's state (enabled/disabled) and ensures the content scripts are retroactively injected into all currently open tabs upon installation, so you don't have to refresh your pages to start using it.
- **Styling (`overlay.css`)**: Injects isolated, conflict-free styles using CSS variables to ensure the keyboard looks beautiful without breaking the host website's design.

## 📦 Installation

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top right corner.
4. Click on **Load unpacked** in the top left corner.
5. Select the `AksharaFlow` directory that you cloned/downloaded.
6. The extension is now installed and ready to use!

## 💡 Usage

1. Open any webpage with a text input.
2. Click the floating **அ** button to reveal the virtual keyboard.
3. Toggle the switch on the top right of the keyboard to enable Tamil typing.
4. Start typing on your physical keyboard, or click the keys on the virtual pad!
