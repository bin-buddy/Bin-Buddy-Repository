import random
from flask import Flask, request, jsonify
from geopy.distance import geodesic

app = Flask(__name__)

# Pricing constants
BASE_SUBSCRIPTION_PRICE = 60  # $60/month for 1 trash + 1 recycle
EXTRA_BIN_PRICE = 20          # $20 per additional bin

# Simulated client data around Scottsdale with bin counts
clients = []
for i in range(30):
    trash_bins = random.choice([1, 2])
    recycle_bins = random.choice([1, 2])
    lat = 33.6 + random.uniform(-0.01, 0.01)
    lng = -111.92 + random.uniform(-0.01, 0.01)
    zone = random.choice(["Zone 1", "Zone 2", "Zone 3"])
    actions = trash_bins * 2 + recycle_bins * 2
    monthly_cost = (
        BASE_SUBSCRIPTION_PRICE
        + (trash_bins - 1) * EXTRA_BIN_PRICE
        + (recycle_bins - 1) * EXTRA_BIN_PRICE
    )
    clients.append({
        "id": i,
        "lat": lat,
        "lng": lng,
        "zone": zone,
        "trash_bins": trash_bins,
        "recycle_bins": recycle_bins,
        "actions": actions,
        "monthly_cost": monthly_cost,
        "firstService": True,
        "instructions": "",
        "photoUrl": ""
    })

zones = {
    "Zone 1": {"worker": "Worker 1"},
    "Zone 2": {"worker": "Worker 2"},
    "Zone 3": {"worker": "Unassigned"},
}

@app.route("/zones")
def get_zones():
    return jsonify(zones)

@app.route("/clients")
def get_clients():
    return jsonify(clients)

@app.route("/clients/<int:client_id>", methods=["PUT"])
def update_client(client_id):
    data = request.json
    for client in clients:
        if client["id"] == client_id:
            client.update(data)
            if client.get("firstService"):
                client["firstService"] = False
            return jsonify({"status": "ok"})
    return jsonify({"status": "error", "message": "Client not found"}), 404

@app.route("/assign", methods=["POST"])
def assign_zone():
    data = request.json
    zone = data.get("zone")
    worker = data.get("worker")
    if zone in zones:
        zones[zone]["worker"] = worker
        return jsonify({"status": "ok", "zone": zone, "worker": worker})
    return jsonify({"status": "error", "message": "Zone not found"}), 404

@app.route("/routes/<worker>")
def get_route(worker):
    assigned_zones = [z for z, info in zones.items() if info["worker"] == worker]
    subset = [c for c in clients if c["zone"] in assigned_zones]
    if not subset:
        return jsonify([])
    start_point = (33.605, -111.935)
    subset_sorted = sorted(
        subset,
        key=lambda c: geodesic(start_point, (c["lat"], c["lng"])).miles
    )
    return jsonify(subset_sorted)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    # Bind to 0.0.0.0 so Render can see it
    app.run(host="0.0.0.0", port=port, debug=True)
