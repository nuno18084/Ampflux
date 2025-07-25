from app.celery_worker import celery_app
import numpy as np
import logging

@celery_app.task
def run_short_circuit_simulation(voltage, resistances, notify_email=None):
    try:
        voltage = float(voltage)
        resistances = np.array(resistances, dtype=float)
        total_resistance = resistances.sum()
        if total_resistance == 0:
            raise ValueError("Total resistance cannot be zero.")
        fault_current = voltage / total_resistance
        result = {
            "status": "ok",
            "fault_current": fault_current,
            "total_resistance": total_resistance
        }
    except Exception as e:
        result = {"status": "error", "error": str(e)}
    # Notification stub
    msg = f"Simulation complete. Result: {result}"
    if notify_email:
        # Here you would send an email using SendGrid/Resend
        logging.info(f"[EMAIL to {notify_email}] {msg}")
    else:
        logging.info(msg)
    return result
