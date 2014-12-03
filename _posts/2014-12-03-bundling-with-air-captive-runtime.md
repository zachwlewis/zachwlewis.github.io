---
layout: post
title: Bundling With AIR Captive Runtime
---

## Overview

Sometimes, the hardest part of making a game is distributing the game after it's been made. If your game is designed to be played as a standalone experience, playing a game in-browser can be a large disappointment. This tutorial is designed to show you how to turn your finished game into a standalone, executable file (either a `.exe` or `.app`, depending on your target operating system) that doesn't require installing Adobe AIR — just double-click and play.

_This guide is written mainly from a Windows perspective, but the `adt` tools are the same on OS X._

## Ingredients

- A game that's ready to distribute
- Adobe AIR (anything after AIR 3.0, but I'll be using AIR 14.0)
- A self-signed certificate (FlashDevelop can generate this for you)
- _Optional_ Some basic knowledge of scripting on your OS

## Instructions

### Setting Everything Up

Before you start powering out some command-line hacker crap, you'll need to be sure you have your AIR binaries added to your system's path.

- [Editing System Path (Windows)] [path-win]
- [Editing System Path (OS X)] [path-osx]

To make sure the AIR tools are properly added to your path, open a command line window and attempt to call the AIR Developer Tool, `adt`. You should get something like this:

<pre>
$ adt
Adobe (R) AIR (R) Developer Tool (ADT)
Version 14.0.0.178
Copyright (c) 2008-2014 Adobe Systems Incorporated. All rights reserved.

No arguments were found
usage:
  adt -checkstore SIGNING_OPTIONS
  adt -certificate -cn &lt;name&gt; ( -ou &lt;org-unit&gt; )? ( -o &lt;org-name&gt; )? ( -c &lt;country&gt; )? ( -validityPeriod &lt;years&gt; )? ( 1024-RSA | 2048-RSA ) &lt;pfx-file&gt; &lt;password&gt;
  adt -help
  adt -migrate SIGNING_OPTIONS ( &lt;air-file-in&gt; | &lt;airn-file-in&gt; ) &lt;output-file&gt;
  adt -package SIGNING_OPTIONS ( -target air )? &lt;output-package&gt; ( &lt;app-desc&gt; FILE_OPTIONS | &lt;input-package&gt; )
  adt -package SIGNING_OPTIONS -target airn &lt;output-package&gt; ( &lt;app-desc&gt; FILE-AND-PATH-OPTIONS | &lt;input-package&gt; )
  adt -package -target ( apk | apk-debug | apk-emulator | apk-captive-runtime ) ( CONNECT_OPTIONS? | LISTEN_OPTIONS? ) ( -airDownloadURL &lt;url&gt; )? ( ARCH_OPTIONS )? SIGNING_OPTIONS &lt;output-package&gt; ( &lt;app-desc&gt; PLATFORM-SDK-OPTION? FILE-AND-PATH-OPTIONS | &lt;input-package&gt; PLATFORM-SDK-OPTION? )
  adt -package -target ( ipa-test | ipa-debug | ipa-app-store | ipa-ad-hoc | ipa-test-interpreter | ipa-debug-interpreter | ipa-test-interpreter-simulator | ipa-debug-interpreter-simulator ) ( CONNECT_OPTIONS? | LISTEN_OPTIONS? ) ( -sampler )? ANE_LINK_OPTIONS? AOT_MODE_OPTIONS? SIGNING_OPTIONS &lt;output-package&gt; ( &lt;app-desc&gt; PLATFORM-SDK-OPTION? FILE-AND-PATH-OPTIONS | &lt;input-package&gt; PLATFORM-SDK-OPTION? )
  adt -package SIGNING_OPTIONS? -target native SIGNING_OPTIONS? &lt;output-package&gt; ( &lt;app-desc&gt; FILE-AND-PATH-OPTIONS | &lt;input-package&gt; )
  adt -package SIGNING_OPTIONS? -migrate SIGNING_OPTIONS -target native SIGNING_OPTIONS? &lt;output-package&gt; &lt;app-desc&gt; FILE_OPTIONS PATH-OPTION
  adt -package SIGNING_OPTIONS? -target bundle SIGNING_OPTIONS? &lt;output-package&gt; ( &lt;app-desc&gt; FILE-AND-PATH-OPTIONS | &lt;input-package&gt; )
  adt -package SIGNING_OPTIONS? -target ane &lt;output-package&gt; &lt;ext-desc&gt; ANE_OPTIONS
  adt -prepare &lt;airi-file&gt; &lt;app-desc&gt; FILE_AND_PATH_OPTIONS
  adt -sign SIGNING_OPTIONS ( -target ( air | airn | ane ) )? ( &lt;airi-file&gt; | &lt;unsigned-ane-file&gt; ) &lt;output-file&gt;
  adt -devices          PLATFORM-OPTION PLATFORM-SDK-OPTION?
  adt -installRuntime   PLATFORM-OPTION PLATFORM-SDK-OPTION? DEVICE-OPTION? ( -package &lt;apk-file&gt; )?
  adt -installApp       PLATFORM-OPTION PLATFORM-SDK-OPTION? DEVICE-OPTION? -package &lt;apk-file | ipa-file&gt;
  adt -uninstallRuntime PLATFORM-OPTION PLATFORM-SDK-OPTION? DEVICE-OPTION?
  adt -uninstallApp     PLATFORM-OPTION PLATFORM-SDK-OPTION? DEVICE-OPTION? -appid &lt;app-id&gt;
  adt -launchApp        { PLATFORM-OPTION PLATFORM-SDK-OPTION? DEVICE-OPTION? ( -debuggerPort port )? -appid &lt;app-id&gt; }
  adt -runtimeVersion   PLATFORM-OPTION PLATFORM-SDK-OPTION? DEVICE-OPTION?
  adt -appVersion       PLATFORM-OPTION PLATFORM-SDK-OPTION? DEVICE-OPTION? -appid &lt;app-id&gt;
  adt -version

SIGNING_OPTIONS      : -storetype &lt;type&gt; ( -keystore &lt;store&gt; )? ( -storepass &lt;pass&gt; )? ( -alias &lt;aliasName&gt; )? ( -keypass &lt;pass&gt; )? ( -providerName &lt;name&gt; )? ( -tsa &lt;url&gt; )? ( -provisioning-profile &lt;profile&gt; )?
FILE_OPTIONS         : &lt;fileOrDir&gt;* ( ( -C &lt;dir&gt; &lt;fileOrDir&gt;+ ) | ( -e &lt;file&gt; &lt;path&gt; ) )*
ARCH_OPTIONS              : -arch (armv7 | x86)
CONNECT_OPTIONS      : -connect &lt;host&gt;
LISTEN_OPTIONS       : -listen &lt;port&gt;
ANE_LINK_OPTIONS     : -hideAneLibSymbols ( yes | no )
ANE_OPTIONS          : -swc &lt;swc&gt; ( -platform &lt;name&gt; (-platformoptions &lt;file&gt;)? &lt;fileOrDir&gt;* ( -C &lt;dir&gt; &lt;fileOrDir&gt;+ )* )*
FILE-AND-PATH-OPTIONS: ( PATH-OPTION | FILE-OPTIONS ) FILE-AND-PATH-OPTIONS?
PATH-OPTION          : -extdir &lt;dir&gt;
PLATFORM-OPTION      : -platform (android | ios)
PLATFORM-SDK-OPTION  : -platformsdk &lt;platform-sdk-home-dir&gt;
DEVICE-OPTION        : -device ( deviceID | ios-simulator )
AOT_MODE_OPTIONS     : -useLegacyAOT ( yes | no )
</pre>

Those are the tools you'll be working with, so get ready. It's time to cook.

### Basic Bundling

To create a bundle with the AIR Captive Runtime (remember, that's the bit that allows it to run without requiring AIR to be installed), you'll be using the `bundle` target. That means, you'll want to use the item from the list that `adt` graciously provided you with the `-target bundle` argument. In case you can't find it, here it is:

<pre>
adt -package SIGNING_OPTIONS? -target bundle SIGNING_OPTIONS? &lt;output-package&gt; ( &lt;app-desc&gt; FILE-AND-PATH-OPTIONS | &lt;input-package&gt; )
</pre>

Got that? Let's break it down.

- `SIGNING_OPTIONS` This is where you slap that self-signed certificate in.
- `output-package` This is the name of the file to output, like `dist\windows`.
- `app-desc` The AIR descriptor XML (should be generated by FlashDevelop)
- `FILE-AND-PATH-OPTIONS` This one can be tricky, but it's a list of all the assets required by your application XML, including `mygame.swf`.

### Bundling In Action

Now that you know the tools, let's look at a sample game, __Super Sample__.  You would probably have a bundle call that looks very similar to this:

<pre>$ adt -package -tsa none -storetype pkcs12 -keystore "cert\supersample.p12" -storepass sspassword123 -target bundle dist\windows application.xml -e "bin/supersample.swf" supersample.swf -C "icons/desktop/icons" . -extdir lib</pre>

Let's dissect this call.

---

<pre><b>$ adt -package</b></pre>

Call the AIR Developer Tool, instructing it to package an application for distribution.

---

<pre>-tsa none -storetype pkcs12 -keystore "cert\supersample.p12" -storepass sspassword123</pre>

Here are the __signing options__.

<pre><b>-tsa none</b> -storetype pkcs12 -keystore "cert\supersample.p12" -storepass sspassword123</pre>

This section instructs the tool to not check the certificate timestamp. This can be useful if your computer isn't connected to the internet or if your certificate file is out of date (shame on you). 

<pre>-tsa none <b>-storetype pkcs12 -keystore "cert\supersample.p12" -storepass sspassword123</b></pre>

This section tells the tool what certificate to use for signing. The conversation might go something like this:

> The certificate is a [PKCS 12] [pkcs-12] certificate. The certificate is found at `cert\supersample.p12`. The password for the certificate is "sspassword123."

---

<pre>-target bundle dist\windows application.xml</pre>

This tells the tool to create an executable bundle with the AIR Captive Runtime in the `dist\windows` directory based on the information in `application.xml`. The XML file will describe the name of the application as well as any other files needed by the application. Since the application's name is stored in `application.xml`, it will use this to name the resulting executable (in this case, it'll probably be `supersample.exe`).

---

<pre>-e "bin/supersample.swf" supersample.swf -C "icons/desktop/icons" . -extdir lib</pre>

Here are the __file and path options__. As I mentioned before, these can be tricky, but I'm sure you'll get the hang of them. The main thing you need to know are the two flags, `-e` and `-C`. `-e` describes an explicit file, while `-C` describes a directory change. Here we go.

<pre><b>-e "bin/supersample.swf" supersample.swf</b> -C "icons/desktop/icons" . -extdir lib</pre>

> The bundle should include the file located at `bin/supersample.swf`, and this file should be in the root directory and named `supersample.swf`.

_If for some reason you needed to change the location or name of the file, you can do that as well. Supposing you goofed real bad and built your file to `output-files/goofed.swf` and set your `application.xml` to look for `swfs/main.swf`, you could change this to:_

<pre><i>-e output-files/goofed.swf swfs/main.swf</i></pre>

<pre>-e "bin/supersample.swf" supersample.swf <b>-C "icons/desktop/icons" .</b> -extdir lib</pre>

This describes an entire folder (in this case, this folder contains the icons to use for the executable file).

> Switch to the directory `icons/desktop/icons`. Now, put all the icons there into the root of the bundle.

_Again, you can change the output, `.`, to point to the proper location in your bundle._

<pre>-e "bin/supersample.swf" supersample.swf -C "icons/desktop/icons" . <b>-extdir lib</b></pre>

This specifies any external libraries you may need in your application. This is often used when working with Native Extensions, (such as [FRESteamWorks] [fresteamworks], which provides your AIR application access to the steamworks libraries).

> Look for Native Extensions in the `lib` directory and bundle those on up as well.

## Advanced Bundling Maneuvers

Once you've gotten the hang of bundling your AIR applications, make life easier on yourself with simple tools.

### Power Bundling

It can be a pain to keep a command window open, and typing all your stuff in sucks. Make life easier by writing a little batch script like this:

#### `bundle.bat`

{% highlight bat %}
@echo off

set SIGNING_OPTIONS=-storetype pkcs12 -keystore "cert\supersample.p12" -storepass sspassword123
set APP_XML=application.xml
set DIST_PATH=dist
set DIST_NAME=windows
set FILE_OR_DIR=-e "bin/supersample.swf" supersample.swf -C "icons/desktop/icons" .

set OUTPUT=%DIST_PATH%\%DIST_NAME%

if not exist "%DIST_PATH%" md "%DIST_PATH%"

set AIR_PACKAGE=adt -package -tsa none %SIGNING_OPTIONS% -target bundle %OUTPUT% %APP_XML% %FILE_OR_DIR% -extdir lib

call where adt
call adt -version
echo $ %AIR_PACKAGE%
call %AIR_PACKAGE%

{% endhighlight %}

This little bad-boy will not only bundle __Super Sample__ by just double-clicking on it, but will also check the location and version of `adt`, create your output folder (if it doesn't exist) and show you the exact command it is calling. Additionally, editing it is easy since all the variables are broken out.

### Automatic Build & Bundle

Once you've created a bundling script like `bundle.bat`, you can instruct __FlashDevelop__ to bundle that puppy upon successful build of your game — now that's a next-level bundling maneuver!

In __FlashDevelop__, open your project's properties and cruise over to the __Build__ tab. Add your bundle batch file to the "Post-Build Command Line" area, making sure that "Always execute" is off (this prevents `bundle.bat` from being run if the build fails).

<img src="//developers-useflashpunk.s3.amazonaws.com/974d676517cc67b6c12f1240719eaa92fd39160f734.PNG">

Now, whenever you build, __FlashDevelop__ will also bundle for you!

If you want to get really fancy and always test your bundled application, hit up that __Output__ tab, select "Run Custom Command..." under "Test Project" and click "Edit...." From there, enter the location of your bundle and save that beast. Now, when you run your application from __FlashDevelop__, it'll run your standalone executable. Wow!

<img src="//developers-useflashpunk.s3.amazonaws.com/975792c118f3f626cf776809436153aebed58f248c3.PNG"> 

[_Originally posted on the FlashPunk Developers forum._] [original]

[path-win]: http://www.howtogeek.com/118594/how-to-edit-your-system-path-for-easy-command-line-access/
[path-osx]: http://www.tech-recipes.com/rx/2621/os_x_change_path_environment_variable/
[pkcs-12]: http://www.wikiwand.com/en/PKCS_12
[fresteamworks]: https://github.com/Ventero/FRESteamWorks
[original]: http://developers.useflashpunk.net/t/bundling-with-air-captive-runtime/1842
