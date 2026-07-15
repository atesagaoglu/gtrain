{
  description = "GTrain – Guitar Training Tool";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forEachSystem = f: nixpkgs.lib.genAttrs supportedSystems (system: f {
        pkgs = import nixpkgs { inherit system; };
      });
    in
    {
      devShells = forEachSystem ({ pkgs }: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            python3
          ];

          shellHook = ''
            echo "🎸 GTrain dev environment loaded — Node $(node --version)"
          '';
        };
      });
    };
}
