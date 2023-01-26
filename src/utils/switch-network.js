const switchSongbirdRequest = () =>
  window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0x13" }],
  });

const addSongbirdRequest = () =>
  window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: "0x13",
        chainName: "SongBird",
        rpcUrls: ["https://sgb.ftso.com.au/ext/bc/C/rpc"],
        blockExplorerUrls: ["https://songbird-explorer.flare.network"],
        nativeCurrency: {
          name: "SGB",
          symbol: "SGB",
          decimals: 18,
        },
      },
    ],
  });

// eslint-disable-next-line import/prefer-default-export
export const switchSongbirdNetwork = async () => {
  if (window.ethereum) {
    try {
      await switchSongbirdRequest();
    } catch (error) {
      if (error.code === 4902) {
        try {
          await addSongbirdRequest();
          await switchSongbirdRequest();
        } catch (addError) {
          // eslint-disable-next-line no-console
          console.log(error);
        }
      }
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
};
