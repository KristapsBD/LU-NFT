# Deploy your own Candy Machine easily
This repository is for Candy Machine V3, Account Version V2. (This is what you have when using the latest sugar version to create the candy machine)

# What does this repo support?
You can use this repo to deploy your own candy machine UI. 
- It supports multiple candy machine groups, but also just using a default group
- It creates a Lookup table for you to allow more active guards at the same time
- The initializer shows you the merkle root for your groups
- The users see NFTs left, start and end countdowns, reasons for not being able to mint and more
- Combining most of these guards is possible since we are lookup tables. For example using `allowlist`,`nftBurn`, `nftPayment`, `solPayment`, `startDate` and `endDate`
- For larger allowlists this UI will automatically split the mint into two transactions to avoid hitting the transaction size limit
- Dynamic Compute Unit calculation to have higher chances to get the mint included into a block
- Priority fees are added. Those are hardcoded to a very small number. As of 15 March 24 all the dynamic solutions are only possibly with specific RPC providers. If you want to have it dynamic you need to implement it yourself.
- It supports most of the existing guards:
  - `addressGate`
  - `allocation`
  - `allowlist`
  - `endDate`
  - `freezeSolPayment`
  - `freezeTokenPayment`
  - `mintLimit`
  - `nftBurn`
  - `nftGate`
  - `nftPayment`
  - `redeemedAmount`
  - `solPayment`
  - `startDate`
  - `token2022Payment`
  - `tokenBurn`
  - `tokenGate`
  - `tokenPayment`
- Multimint (can be deactivated by adding `NEXT_PUBLIC_MULTIMINT=false` to `.env`)

# How to use
## Prerequisites
- [pnpm](https://pnpm.io/installation) as package manager - I used 8.1.0
- [sugar](https://docs.metaplex.com/developer-tools/sugar/guides/sugar-for-cmv3) to create your candy machine

## How to use
1. Clone this repo
2. Run `pnpm install`
3. copy the `.env.example` file to a new `.env` file and fill in the NEXT_PUBLIC_CANDY_MACHINE_ID value. You should have this value after creating your candy machine with sugar. 
3. Run `pnpm run dev`
4. Open your browser at `http://localhost:3000`
5. Connect your wallet which you used to create the candy machine
6. You should see a red `initialize` button. Click it and then click `create LUT`
7. Copy the LUT address that you see in the green success box and paste it into the `.env` file as the value for `NEXT_PUBLIC_LUT`
8. Add your candy machine groups to the `settings.tsx` file.  E.g. if one of your groups is called `WL` you should have an entry for it in there, too
9. Deploy your Candy Machine e.g. to Vercel or Cloudflare Pages

Done!

### customization
You can customize the UI by changing the code. If you just want to modify some values you can instead
- modify `settings.tsx` to change the texts and Image. 
  - `image` is the main image that is shown. You could change it to your project logo.
  - `headerText` is the website header. You could change it to your project name.
- Decide if you want to allow multiple mints by a single user at the same time and in your `.env` file set `NEXT_PUBLIC_MULTIMINT` accordingly to `true` or `false`. By default a maximum of 15 NFTs can be minted at the same time this is because of wallet limitations. If you want to have less change `NEXT_PUBLIC_MAXMINTAMOUNT` in `.env`.
- Change Priority fees if you want. By default it is set to the cheapest that is still considered to have priority fees. https://twitter.com/CloakdDev/status/1776661443330339285

If you want to work together on projects let me know!

# Disclaimer
This is not an official project by the Metaplex team. You can use that code at your own risk. I am not responsible for any losses that you might incur by using this code.