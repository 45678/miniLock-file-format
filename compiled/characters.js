(function() {
  var Base58;

  Base58 = miniLockLib.Base58;

  window.characters = {
    find: function(miniLockID) {
      var character, name;
      for (name in this) {
        character = this[name];
        if (name !== "find") {
          if (miniLockID === character.miniLockID) {
            return character;
          }
        }
      }
      return void 0;
    },
    Alice: {
      name: "Alice",
      secretPhrase: "lions and tigers are not the only ones i am worried about",
      emailAddress: "alice@example.com",
      miniLockID: "CeF5fM7SEdphjktdUbAXaMGm13m6mTZtbprtghvsMRYgw",
      publicKey: Base58.decode("3dz7VdGxZYTDQHHgXij2wgV3GRBu4GzJ8SLuwmAVB4kR"),
      secretKey: Base58.decode("DsMtZntcp7riiWy9ng1xZ29tMPZQ9ioHNzk2i1UyChkF")
    },
    Bobby: {
      name: "Bobby",
      secretPhrase: "No I also got a quesadilla, it’s from the value menu",
      emailAddress: "bobby@example.com",
      miniLockID: "2CtUp8U3iGykxaqyEDkGJjgZTsEtzzYQCd8NVmLspM4i2b",
      publicKey: Base58.decode("GqNFkqGZv1dExFGTZLmhiqqbBUcoDarD9e1nwTFgj9zn"),
      secretKey: Base58.decode("A699ac6jesP643rkM71jAxs33wY9mk6VoYDQrG9B3Kw7")
    },
    Sarah: {
      name: "Sarah",
      secretPhrase: "so just so you know it is like a little bit on the sweet side.",
      emailAddress: "sarah@example.com",
      miniLockID: "2H6TvBdYdWxy5z6KW6Ba5ZBb3B4XFAGVPsCHKmoYyJijCK",
      publicKey: Base58.decode("HneN7VDc1SpbfJyJU18Vg1azaztiGhDKmuQBbcvTocHM"),
      secretKey: Base58.decode("5REjRWz4VgLXw5uupjTJyUk4sNMj23cpCFdXwNbVaVaf")
    }
  };

}).call(this);
