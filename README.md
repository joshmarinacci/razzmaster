# razzmaster
Find and set up new Raspberry Pis on your network


# Scan for Raspberry Pis on your network
```
node find
```

This will scan for probably raspberry pis on your network using MAC addresses for common
Raspberry Pi ethernet and wifi dongles. It will print a list of every
MAC address it finds and whether it is likely to be a Raspberry Pi or not.


# Configure the Raspberry Pi:

```
node install --config config.json --host 192.168.1.23 --username pi --password foo
```

This command will ssh into the Raspberry Pi with the host ip address, username, and password
supplied. It will use `config.json` to decide what to install.

Your `config.json` file will look like this:

```
{
    "packages":[
        "git",
        "curl",
        "bluez",
        "bluez-hcidump",
        "nodejs"
    ],
    "git":[
        "https://github.com/joshmarinacci/amx.git"
    ]
}
```


The `packages` array is a list of Debian packages to install. The `nodejs` package is
treated special. It will install from nodesource.org instead of the regular repos.

The `git` array is a list of git repos to fetch.


## Todo


* set the wifi info
* set the hostname
* change the default users password
* configure node for proper npm -g support
* set extra/custom services to start on demand
* set x in kiosk mode with chromium

