import { useAlert } from ".";

export default function AlertComponent() {
  const alert_store = useAlert();
  return (
    <>
      {alert_store.status && (
        <section
          onClick={() => {
            if (!alert_store.force) {
              alert_store.clear();
            }
          }}
          style={{ background: `${alert_store.bg && "url(/bg.webp)"}` }}
          data-tauri-drag-region
          className="fixed z-[100] inset-0 bg-black/60 flex !bg-center !bg-cover flex-col items-center justify-center">
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-64 p-4 bg-white/6 outline-1 -outline-offset-1 outline-white/6 backdrop-blur-2xl shadow-xl shadow-black/20 rounded-lg flex flex-col items-center justify-center">
            <h1 className="font-bold text-base text-center mt-1">
              {alert_store.title}
            </h1>
            <p className="text-xs !select-all text-center font-light">
              {alert_store.message}
            </p>
            <div className="flex flex-col-reverse w-full mt-auto pt-4 justify-end gap-2">
              {!alert_store.force && (
                <button
                  className={`w-full ${alert_store.action ? "!bg-white/6" : "!bg-primary"}`}
                  onClick={alert_store.clear}
                  type="button">
                  {alert_store.action ? "Cancel" : "Done"}
                </button>
              )}
              {alert_store.action && (
                <button
                  className="w-full"
                  onClick={async () => {
                    await alert_store.action?.();
                    alert_store.beforeAction?.();
                    alert_store.clear();
                  }}
                  type="button">
                  Done
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
