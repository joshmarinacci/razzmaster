# razzmaster
Find and set up new Raspberry Pis on your network


# Scan for Raspberry Pis on your network
```
node find
```

This will scan for probably raspberry pis on your network using MAC addresses for common
Raspberry Pi ethernet and wifi dongles. It will print a list of every
MAC address it finds and whether it is likely to be a Raspberry Pi or not.


# Blink your Raspberry Pi

Just to make sure you are really connecting to the pi you think you are, make the
green LED blink like this:

```
node blink --host 192.168.1.23 --username pi --password foo
```

Press ctrl-C to stop it.


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


### Setup Wifi

Add a 'wifi' section like this:

```json
{
   "wifi": {
       "ssid":"myrouter",
       "password":"mypassword"
   }
}
```
   

## Todo


* -- done -- set the wifi info
* set the hostname
* change the default users password
* configure node for proper npm -g support
* set extra/custom services to start on demand
* set x in kiosk mode with chromium
* disable starting x


## A full headless install

Yes, it is possible to start with a blank RaspberryPi and get it running on the network with your
desired configuration without using a directly connected screen. You'll have to flash a Raspbian image
directly to the flashcard first, since NOOBS requires a screen to use, but then you can do the rest
with RazzMaster.

first, download the raspbian image via torrent or direct download. this is a giant zip file which
regular MacOSX unzip can't handle. If you unzip it from the command line you'll get an error about

```
need PK compat. v4.5 (can do v2.1)
```

So install p7zip via brew and unzip with that.

```
brew install p7zip
7za x your_raspian_image_file.img
```

Then write the image to your SD card as described in the standard docs here

https://www.raspberrypi.org/documentation/installation/installing-images/README.md

now put the SD card in your Pi and boot it. Since it doesn't have any wifi access yet,
you'll need to boot it with wired ethernet connected to your other computer or a router.
Make sure the ethernet port is live before you boot the Pi. ex: if you are plugging the pi directly
into a port on your Mac then you'll need to turn on internet sharing so that the Pi can get an IP address
when it boots.

let it boot for about 3 minutes (pi2) since it's going to load a full desktop environment.
then run `node find`.



