{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      perSystem =
        { pkgs, ... }:
        {
          formatter = pkgs.treefmt;

          # Development shell
          devShells.default = pkgs.mkShell {
            packages = with pkgs; [
              bun
              git
              nil
              nixd
              nixfmt
              treefmt
              yamlfmt
            ];

            shellHook = ''
              # Only exec into user shell for interactive sessions
              # Skip for non-interactive commands (like VSCode env detection)
              if [ -t 0 ] && [ -z "$__NIX_SHELL_EXEC" ]; then
                export __NIX_SHELL_EXEC=1

                # Detect user's login shell (works on both macOS and Linux)
                if command -v dscl >/dev/null 2>&1; then
                  # macOS
                  USER_SHELL=$(dscl . -read ~/ UserShell | sed 's/UserShell: //')
                elif command -v getent >/dev/null 2>&1; then
                  # Linux
                  USER_SHELL=$(getent passwd $USER | cut -d: -f7)
                else
                  # Fallback: read /etc/passwd directly
                  USER_SHELL=$(grep "^$USER:" /etc/passwd | cut -d: -f7)
                fi

                exec ''${USER_SHELL:-$SHELL}
              fi
            '';
          };

          # Runtime test shell
          devShells.runtime-test = pkgs.mkShell {
            packages = with pkgs; [
              bun
              nodejs
              nodePackages.pnpm
              deno
            ];
          };
        };
    };
}
