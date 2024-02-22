package trivy

# Ensure that Docker images do not use the 'latest' tag
deny_latest_tag[msg] {
    input[i].Services[name].Image
    endswith(input[i].Services[name].Image, ":latest")
    msg := sprintf("Service '%s' uses 'latest' tag for its image, which is not recommended for reproducible builds.", [name])
}

# Enforce environment variable patterns for sensitive information
deny_sensitive_info_plain_text[msg] {
    sensitive_keys := ["PASSWORD", "SECRET", "TOKEN"]
    var := input[i].Services[name].Environment[_]
    contains(var, sensitive_keys[_])
    not startswith(var, "${")
    msg := sprintf("Service '%s' has sensitive information in plaintext in its environment variables.", [name])
}

# Require volume configurations for certain services
deny_missing_volume_configuration[msg] {
    required_volumes := {"postgresql": ["/bitnami/postgresql", "/docker-entrypoint-initdb.d"]}
    service := input[i].Services[name]
    required_volumes[name]
    volumes := [vol | vol := service.Volumes[_]; startswith(vol, required_volumes[name][_])]
    count(volumes) != count(required_volumes[name])
    msg := sprintf("Service '%s' is missing required volume configurations.", [name])
}

# Enforce port configurations to be bound to localhost for specific services
deny_unbound_ports[msg] {
    service := input[i].Services[name]
    ports := service.Ports[_]
    not startswith(ports, "127.0.0.1:")
    msg := sprintf("Service '%s' has ports that are not bound to localhost, which might expose them publicly.", [name])
}
