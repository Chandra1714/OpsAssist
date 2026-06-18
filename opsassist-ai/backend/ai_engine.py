from .incident_model import Incident


def analyze_incident_rule_based(incident: Incident) -> dict:
    description = (incident.description or "").lower()
    error_message = (incident.error_message or "").lower()
    logs = (incident.logs or "").lower()
    combined = "\n".join([description, error_message, logs])
    recommendations = []
    root_cause = "Unable to determine root cause from structured data."

    if incident.severity.lower() == "critical":
        recommendations.extend([
            "Notify the incident response team immediately.",
            "Isolate affected systems to prevent further impact.",
        ])
    elif incident.severity.lower() == "high":
        recommendations.extend([
            "Schedule an immediate review with operations staff.",
            "Collect additional logs and metrics from affected systems.",
        ])
    else:
        recommendations.extend([
            "Document the incident and monitor for recurrence.",
            "Plan a post-incident review once the situation stabilizes.",
        ])

    if "oomkilled" in combined or "out of memory" in combined:
        root_cause = "The workload was likely killed due to memory exhaustion."
        recommendations.append("Review pod and container memory limits and heap configurations.")
    elif "crashloopbackoff" in combined or "crash loop backoff" in combined:
        root_cause = "The application is repeatedly failing to start and is stuck in a crash loop."
        recommendations.append("Inspect the container startup logs and health probe configuration.")
    elif "timeout" in combined or "latency" in combined:
        root_cause = "There is likely a network or service performance issue causing timeouts."
        recommendations.append("Validate network connectivity, load balancer health, and service dependencies.")
    elif "database" in combined or "db" in combined or "query" in combined:
        root_cause = "The incident appears related to database connectivity or slow queries."
        recommendations.append("Check database connection pools, query performance, and replication status.")
    elif "permission denied" in combined or "access denied" in combined:
        root_cause = "A permissions or access control failure is likely preventing the operation."
        recommendations.append("Review IAM policies, service accounts, and RBAC rules.")
    elif "disk" in combined or "storage" in combined or "no space" in combined:
        root_cause = "The host or container may be impacted by storage exhaustion."
        recommendations.append("Verify disk usage, volume mounts, and storage quotas.")
    elif "cpu" in combined or "throttle" in combined:
        root_cause = "The container or node may be CPU constrained."
        recommendations.append("Inspect CPU requests/limits and node utilization.")

    if "network" in combined:
        recommendations.append("Check network paths, DNS resolution, and firewall rules.")
    if "server" in combined or "host" in combined:
        recommendations.append("Inspect the health of the affected host and its resource usage.")
    if "error" in combined or "failed" in combined or "failure" in combined:
        recommendations.append("Review the relevant error logs and trace the failure path.")

    summary = (
        f"Incident '{incident.title}' with severity {incident.severity} is currently {incident.status}."
    )

    return {
        "summary": summary,
        "recommendations": recommendations,
        "root_cause": root_cause,
        "confidence_score": 0.65,
        "suggested_commands": [
            "kubectl describe pod <pod-name>",
            "kubectl logs <pod-name>",
            "kubectl get events --namespace <namespace>",
        ],
    }


def ai_chat_response(messages: list[dict], incident: Incident | None = None) -> str:
    last_user = messages[-1]["content"] if messages else ""
    if incident:
        return (
            "Based on the selected incident, review the current status and application stack. "
            "If the error includes OOMKilled or CrashLoopBackOff, check resource limits and startup probes. "
            "Provide any relevant logs and error messages for the next step."
        )
    if "root cause" in last_user.lower() or "why" in last_user.lower():
        return "Review the incident details and logs for the earliest error entry; focus on memory, permission, or network failures."
    return "I recommend checking the most recent logs and the incident metadata to determine whether this is a resource, network, or application issue."
