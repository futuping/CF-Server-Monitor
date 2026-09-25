{
  description = "CF-Server-Monitor development environment (Node.js 22 and npm)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { nixpkgs, ... }:
    let
      system = "aarch64-darwin";
      pkgs = nixpkgs.legacyPackages.${system};

      nodejs = pkgs.nodejs_22;
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = [
          nodejs
        ];

        shellHook = ''
          echo "CF-Server-Monitor development environment"
          echo "Node.js: $(node --version)"
          echo "npm: $(npm --version)"
          echo "Use npm ci and npm run build:frontend; retain package-lock.json."
        '';
      };

      checks.${system}.toolchain =
        pkgs.runCommand "node-toolchain-check"
          {
            nativeBuildInputs = [
              nodejs
            ];
          }
          ''
            {
              node --version
              npm --version
            } >"$out"
          '';

      formatter.${system} = pkgs.nixfmt-tree;
    };
}
