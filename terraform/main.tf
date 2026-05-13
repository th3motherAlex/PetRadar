locals {
  name_prefix = "${var.ENVIRONMENT}-incident"
}

resource "azurerm_resource_group" "incident" {
  name     = "${local.name_prefix}-rg"
  location = var.LOCATION
}

resource "azurerm_virtual_network" "incident" {
  name                = "${local.name_prefix}-vnet"
  location            = azurerm_resource_group.incident.location
  resource_group_name = azurerm_resource_group.incident.name
  address_space       = ["10.10.0.0/16"]
}

resource "azurerm_subnet" "incident" {
  name                 = "${local.name_prefix}-subnet"
  resource_group_name  = azurerm_resource_group.incident.name
  virtual_network_name = azurerm_virtual_network.incident.name
  address_prefixes     = ["10.10.1.0/24"]
}

resource "azurerm_public_ip" "incident" {
  name                = "${local.name_prefix}-public-ip"
  location            = azurerm_resource_group.incident.location
  resource_group_name = azurerm_resource_group.incident.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_network_security_group" "incident" {
  name                = "${local.name_prefix}-nsg"
  location            = azurerm_resource_group.incident.location
  resource_group_name = azurerm_resource_group.incident.name

  security_rule {
    name                       = "AllowSSH"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_network_interface" "incident" {
  name                = "${local.name_prefix}-nic"
  location            = azurerm_resource_group.incident.location
  resource_group_name = azurerm_resource_group.incident.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.incident.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.incident.id
  }
}

resource "azurerm_network_interface_security_group_association" "incident" {
  network_interface_id      = azurerm_network_interface.incident.id
  network_security_group_id = azurerm_network_security_group.incident.id
}

resource "azurerm_linux_virtual_machine" "incident" {
  name                = "${local.name_prefix}-vm"
  location            = azurerm_resource_group.incident.location
  resource_group_name = azurerm_resource_group.incident.name
  size                = var.vm_size
  admin_username      = var.admin_username
  network_interface_ids = [
    azurerm_network_interface.incident.id,
  ]

  disable_password_authentication = true

  admin_ssh_key {
    username   = var.admin_username
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }
}
